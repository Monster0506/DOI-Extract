// Function to extract metadata for a DOI using CrossRef
import fetch from "node-fetch";
import express from "express";
import { XMLParser } from "fast-xml-parser";
const app = express();
const port = 3000 || process.env.PORT;
import cors from "cors";

app.use(cors());

async function getDOIMetadata(doi) {
  const crossRefKey = "fx.coudert@chimie-paristech.fr";

  // Normalize DOI if it contains URL or other prefixes
  if (doi.startsWith("https://")) doi = doi.slice(8);
  if (doi.startsWith("http://")) doi = doi.slice(7);
  if (doi.startsWith("dx.")) doi = doi.slice(3);
  if (doi.startsWith("doi.org/")) doi = doi.slice(8);

  // Construct the API query URL
  const params = new URLSearchParams({
    id: `doi:${doi}`,
    noredirect: "true",
    pid: crossRefKey,
    format: "unixref",
  });

  const url = `http://www.crossref.org/openurl/?${params.toString()}`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch metadata from CrossRef");
      }
      return response.text();
    })
    .then((xmlString) => {
      const parser = new XMLParser();
      const doc = parser.parse(xmlString);
      const records =
        doc["doi_records"]?.["doi_record"]?.["crossref"]?.["journal"];

      if (!records) {
        throw new Error("No metadata found for the given DOI");
      }

      const getNodeData = (container, tagName) => {
        return container?.[tagName] || null;
      };

      let authors =
        records["journal_article"]?.["contributors"]?.["person_name"] || [];

      if (Array.isArray(authors)) {
        authors = authors.map((person) => {
          const surname = person?.["surname"];
          const givenName = person?.["given_name"];
          return surname && givenName
            ? `${surname}, ${givenName}`
            : surname || givenName;
        });
      } else {
        const surname = authors?.["surname"];
        const givenName = authors?.["given_name"];
        authors = [`${surname}, ${givenName}`];
      }

      let year = records["journal_issue"]?.["publication_date"];
      if (Array.isArray(year)) {
        year = records["journal_issue"]?.["publication_date"]?.[0]?.["year"];
      } else {
        year = records["journal_issue"]?.["publication_date"]?.["year"];
      }

      const metadata = {
        fullJournal: getNodeData(records["journal_metadata"], "full_title"),
        shortJournal: getNodeData(records["journal_metadata"], "abbrev_title"),
        volume: getNodeData(
          records["journal_issue"]?.["journal_volume"],
          "volume",
        ),
        issue: getNodeData(records["journal_issue"], "issue"),
        year: year,
        title: Object.values(
          records["journal_article"]?.["titles"]?.["title"],
        ).join(""),
        firstPage: getNodeData(
          records["journal_article"]?.["pages"],
          "first_page",
        ),
        lastPage: getNodeData(
          records["journal_article"]?.["pages"],
          "last_page",
        ),
        doi: getNodeData(records["journal_article"]?.["doi_data"], "doi"),
        authors: authors,
        abstract: getNodeData(records["journal_article"]?.["abstract"], "p"),
        crossRefURL: url,
      };

      return metadata;
    });
}
// Route handler for /api/doi/:string
app.get("/api/doi/:string", cors(), async (req, res) => {
  try {
    const doiString = req.params.string; // Extract DOI string from the route
    const metadata = await getDOIMetadata(doiString); // Call getMetadata with DOI string
    res.json(metadata); // Return metadata as JSON
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
