import { useState } from "react";
import "./App.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

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



function SearchBar({handleSearch}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(searchQuery)
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
        />
        <Button variant="outline-secondary" id="basic-search" onClick={ () => handleSearch(searchQuery)}>
          Search
        </Button>
      </InputGroup>
    </Container>
  );
}
function App() {
  const [googlesearchUrl, setGoogleSearchUrl] = useState('');
  const [bingsearchUrl, setBingSearchUrl] = useState('');

  const handleSearch = (e) => {
   
    const encodedQuery = encodeURIComponent(e);
    const url = `https://www.google.com/search?igu=1&source=hp&ei=lheWXriYJ4PktQXN-LPgDA&q=${encodedQuery}`;
    const bingurl = `https://www.bing.com/search?q=${encodedQuery}`;

    setGoogleSearchUrl(url);
    setBingSearchUrl(bingurl);
  };
  return (
    <>
      <Background />
      <Navigation />
      <SearchBar handleSearch={handleSearch}/>
      <Container>
        <Tabs
          defaultActiveKey="dancing_search"
          id="search-tab"
          className="mb-3"
          
        >
          <Tab eventKey="dancing_search" title="Dancing Search">
            Dancing Search Result
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
