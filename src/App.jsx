import { useState, useEffect } from "react";
import "./App.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Card } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";

function Navigation() {
  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand
            href="/"
            style={{ fontSize: "32px", fontWeight: "600" }}
          >
            Dancing Search Engine
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
      </Navbar>
    </>
  );
}
function Background() {
  return (
    <div style={{ background: "#ccc", height: "300px" }}>
      <img
        src="/img_background.jpg"
        height={"100%"}
        style={{ objectFit: "cover", width: "100%", objectPosition: "0% 68%" }}
      />
    </div>
  );
}

function SearchBar({ handleSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchQuery);
    }
  };
  return (
    <Container>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Enter your search text here..."
          aria-label="Search"
          aria-describedby="basic-search"
          value={searchQuery}
          onKeyDown={handleKeyPress}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
        />
        <Button
          variant="outline-secondary"
          id="basic-search"
          onClick={() => handleSearch(searchQuery)}
          style={{
            backgroundColor: "#2880B9",
            borderColor: "#2880B9",
            color: "#FFFFFF",
          }}
        >
          Search
        </Button>
      </InputGroup>
    </Container>
  );
}
function App() {
  const limit = 30;
  const [googlesearchUrl, setGoogleSearchUrl] = useState("");
  const [bingsearchUrl, setBingSearchUrl] = useState("");
  const [clusteringOption, setClusteringOption] = useState("None");
  const [queryExpansionOption, setQueryExpansionOption] = useState("None");
  const [searchText, setSearchText] = useState("");
  const [pageRank, setPageRank] = useState(true);
  const [hits, setHits] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginated, setPaginated] = useState(0);
  const [originalData, setOriginalData] = useState([]);
  const [clusteringResults, setClusteringResults] = useState([]);
  const [expandedQuery, setExpandedQuery] = useState("");
  const handleClusteringChange = (e) => {
    setClusteringOption(e.target.value);
  };

  const handleQueryExpansionChange = (e) => {
    setQueryExpansionOption(e.target.value);
  };

  useEffect(() => {
    callQueryExpansion();
  }, [queryExpansionOption]);

  useEffect(() => {
    querySolr(searchText, currentPage);
  }, [pageRank, hits]);

  useEffect(() => {
    queryCluster(originalData);
  }, [clusteringOption]);

  async function callQueryExpansion() {
    const url = "http://localhost:3000/query_expansion";
    let solr_results = originalData?.response?.docs;
    if (queryExpansionOption === "None") {
      if (clusteringOption === "None") {
        return await querySolr(searchText, currentPage);
      }
      return await queryCluster(originalData);
    }

    if (clusteringOption !== "None") {
      solr_results = clusteringResults;
    }

    if (queryExpansionOption !== "None") {
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          solr_results,
          clustertype: queryExpansionOption,
          query: searchText,
        }),
      };
      const { data } = await fetch(url, fetchOptions).then((response) =>
        response.json()
      );
      console.log(data);
      if (data) {
        setExpandedQuery(data);
        setCurrentPage(1);
        setPaginated(0);
        await querySolr(data, 1, true); //true passed for expanded_query parameter
      }
    }
  }

  async function queryCluster(response) {
    const url = "http://localhost:3000/cluster";

    if (clusteringOption === "None") {
      return await querySolr(searchText, currentPage);
    }

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documents: response, method: clusteringOption }),
    };
    const { data } = await fetch(url, fetchOptions).then((response) =>
      response.json()
    );
    if (data) {
      console.log("My data", data);
      setSearchResults(data);
      setClusteringResults(data);
    }
  }

  function truncateTextToWords(text, numWords) {
    // Split the text into words
    const words = text.split(" ");

    // Join the desired number of words together
    const truncatedText = words.slice(0, numWords).join(" ");

    // Add ellipsis if the original text has more words than the truncated text
    if (words.length > numWords) {
      return truncatedText + "...";
    }

    return truncatedText;
  }

  const handleSearch = async (e) => {
    setError("");
    setSearchText(e);
    if (!pageRank && !hits) {
      setError("Page Rank or HITS must be selected");
      return;
    }

    setClusteringOption("None");
    setQueryExpansionOption("None");
    await querySolr(e, currentPage);
    const encodedQuery = encodeURIComponent(e);
    const url = `https://www.google.com/search?igu=1&source=hp&ei=lheWXriYJ4PktQXN-LPgDA&q=${encodedQuery}`;
    const bingurl = `https://www.bing.com/search?q=${encodedQuery}`;

    setGoogleSearchUrl(url);
    setBingSearchUrl(bingurl);
  };

  const renderPagination = () => {
    const paginationItems = [];

    // First and Prev buttons
    paginationItems.push(
      <Pagination.First key="first" onClick={() => querySolr(searchText, 1)} />,
      <Pagination.Prev
        key="prev"
        onClick={() => querySolr(searchText, currentPage - 1)}
      />
    );

    // Pagination items for current page and surrounding pages
    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(paginated, currentPage + 2);
      i++
    ) {
      paginationItems.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => querySolr(searchText, i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Ellipsis for items before current page
    if (currentPage > 3) {
      paginationItems.unshift(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    // Ellipsis for items after current page
    if (currentPage < paginated - 2) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    // Next and Last buttons
    paginationItems.push(
      <Pagination.Next
        key="next"
        onClick={() => querySolr(searchText, currentPage + 1)}
      />,
      <Pagination.Last
        key="last"
        onClick={() => querySolr(searchText, paginated)}
      />
    );

    console.log(paginationItems);
    return paginationItems;
  };

  const querySolr = async (e, page, expanded_query) => {
    const url = "http://localhost:3000";
    setCurrentPage(page);

    // Define query parameters as an object
    const queryPayload = {
      query: e,
      algo: pageRank ? "pagerank" : "hits",
      page: page ?? currentPage,
      expanded_query: expanded_query,
    };

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    };
    const { data } = await fetch(url, fetchOptions).then((response) =>
      response.json()
    );
    if (!expanded_query) {
      setExpandedQuery("");
    }

    const totalPages = data.response.numFound;
    setOriginalData(data);
    const pages = Math.floor(totalPages / limit);
    setPaginated(pages);
    setSearchResults(data.response.docs);

    return data.response.docs;
  };
  const handleCheckboxChange = (e) => {
    if (e === "hits") {
      setHits(true);
      setPageRank(false);
    }

    if (e === "pagerank") {
      setPageRank(true);
      setHits(false);
    }
  };
  return (
    <>
      <Background />
      <Navigation />
      <SearchBar handleSearch={handleSearch} />
      <Container>
        <Tabs
          defaultActiveKey="dancing_search"
          id="search-tab"
          className="mb-3"
        >
          <Tab eventKey="dancing_search" title="Dancing Search">
            <div className="row">
              <div key={`inline-radio`} className="mb-3 col-md-4">
                <h3 style={{ color: "#80B928", fontSize: "22px" }}>
                  Relevance Model
                </h3>
                <Form.Check
                  inline
                  label="Page Rank"
                  name="pagerank"
                  type="radio"
                  checked={pageRank}
                  onChange={(e) => handleCheckboxChange("pagerank")}
                />
                <Form.Check
                  inline
                  label="HITS"
                  name="hits"
                  type="radio"
                  checked={hits}
                  onChange={(e) => handleCheckboxChange("hits")}
                />
              </div>
              <div className="mb-3 col-md-4">
                <h3 style={{ color: "#80B928", fontSize: "22px" }}>
                  Clustering Option
                </h3>
                <Form.Control
                  as="select"
                  value={clusteringOption}
                  onChange={handleClusteringChange}
                >
                  <option value="None">None</option>
                  <option value="Flat_Clustering">Flat Clustering</option>
                  <option value="Agglomerative_Average_Link_Clustering">
                    Agglomerative Average Link Clustering
                  </option>
                  <option value="Agglomerative_Complete_Link_Clustering">
                    Agglomerative Complete Link Clustering
                  </option>
                  <option value="Agglomerative_Ward_Link_Clustering">
                    Agglomerative Ward Link Clustering
                  </option>
                </Form.Control>
              </div>

              <div className="mb-3 col-md-4">
                <h3 style={{ color: "#80B928", fontSize: "22px" }}>
                  Query Expansion Option
                </h3>
                <Form.Control
                  as="select"
                  value={queryExpansionOption}
                  onChange={handleQueryExpansionChange}
                >
                  <option value="None">None</option>
                  <option value="association">Association</option>
                  <option value="metric">Metric</option>
                  <option value="scalar">Scalar</option>
                </Form.Control>
              </div>
            </div>

            {<div style={{ color: "red" }}>{error}</div>}
            {!error && (
              <div>
                <h1 style={{ fontSize: "22px", marginTop: "50px" }}>
                  {searchResults.length <= 0 && (
                    <div>Welcome to Custom Dance Search!!</div>
                  )}
                  {expandedQuery && queryExpansionOption !== "None" && (
                    <div style={{ fontSize: "24px" }}>
                      <span style={{ color: "red" }}>Expanded Query:</span>{" "}
                      {expandedQuery}
                    </div>
                  )}
                </h1>
                <div>
                  {searchResults.map((result, i) => (
                    <Card key={i} style={{ width: "100%", marginTop: "20px" }}>
                      <Card.Body>
                        <Card.Link
                          style={{ fontSize: "22px", fontWeight: "600" }}
                          href={result?.url}
                          target="_blank"
                        >
                          {result?.title}
                        </Card.Link>

                        <Card.Text style={{ fontSize: "14px" }}>
                          {result?.url}
                          {result?.cluster_id &&
                            result?.cluster_id !== null && (
                              <span style={{ color: "blue" }}>
                                {" "}
                                | Cluster ID: {result?.cluster_id}
                              </span>
                            )}
                        </Card.Text>
                        <Card.Text>
                          {truncateTextToWords(
                            Array.isArray(result?.content)
                              ? result?.content[0]
                              : result?.content,
                            20
                          )}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                  {searchResults.length > 0 && (
                    <Pagination>{renderPagination()}</Pagination>
                  )}
                </div>
              </div>
            )}
          </Tab>
          <Tab eventKey="google" title="Google">
            {googlesearchUrl && (
              <iframe
                title="Google Search Results"
                src={googlesearchUrl}
                width="100%"
                height="600px"
              />
            )}
          </Tab>
          <Tab eventKey="bing" title="Bing">
            {googlesearchUrl && (
              <iframe
                title="Bing Search Results"
                src={bingsearchUrl}
                width="100%"
                height="600px"
              />
            )}
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}

export default App;
