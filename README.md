# WayBack-Downloader
Get all files from a domain in WayBack Machine and filter by contained text

# Usage
```
node wbd.js <Url> <Query>
```

Url: Domain from where to look for snapshots ex: https://github.com/Santiagorich
Query: Text in the page's html ex: MilaFinder

Directories and cooldowns can be changed modifying the consts in wbd.js

Default Directories:

SearchResults - for queried data
Files - for the downloaded data

The script will check for existing pages and resume from where it got an error or was left off, if there is an incomplete page just delete it and run it again
