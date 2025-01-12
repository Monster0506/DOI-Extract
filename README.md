# DOI Metadata Extraction API

This API provides metadata extraction for a given DOI. It uses CrossRef to fetch metadata in XML format and returns the extracted data as a JSON object.

## Features

- Extracts detailed metadata for a DOI, including:
  - Full and short journal titles
  - Volume, Issue, Year
  - Article title, first and last page
  - Authors
  - DOI
  - CrossRef URL for direct access
- Provides the option to fetch metadata via HTTP GET request at `/api/doi/:doi`.

## Example Output

```json
{
  "fullJournal": <string>,
  "shortJournal": <string>,
  "volume": <number>,
  "issue": <number>,
  "year": <number>,
  "title": <string>,
  "firstPage": <number>,
  "lastPage": <number>,
  "doi": <string>,
  "authors": <list<string>>,
  "crossRefURL": <string>
}
```

## Setup

1. Clone the repository:

```bash
git clone https://github.com/monster0506/doi-extract.git
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will be running at `http://localhost:3000`. You can make GET requests to fetch DOI metadata.

## Example API request

Must url-encode the doi

GET <http://localhost:3000/api/doi/10.1177%2f1468794106093622>

## Demo Page

GET <https://doi-extract.vercel.app/api/doi/10.1177%2f1468794106093622>
