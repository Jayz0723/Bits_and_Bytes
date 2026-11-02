"""Search worker: one JSON request on stdin, one JSON response on stdout.

Uses only Python's standard library. The parent server supplies a public index;
this worker never opens the account database or receives API credentials.
"""

import json
import sys
import unicodedata


def normalize(value):
    """Make searches case-insensitive and tolerant of accented characters."""
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(char for char in decomposed if not unicodedata.combining(char)).lower()


def search(entries, query, kind="All"):
    if not isinstance(query, str) or len(query) > 150:
        raise ValueError("Search must be at most 150 characters.")
    if kind not in ("All", "Products", "Articles", "Pages"):
        raise ValueError("Invalid search category.")
    phrase = normalize(query.strip())
    words = phrase.split()
    if not words:
        return []

    def score(entry):
        title = normalize(entry["title"])
        primary = normalize(entry.get("primary", entry["title"]))
        return 20 * (phrase in title) + 5 * sum(word in primary for word in words)

    matches = [
        entry for entry in entries
        if (kind == "All" or entry["kind"] == kind)
        and all(word in normalize(entry["words"]) for word in words)
    ]
    # Stable sorting preserves catalog order when relevance scores are equal.
    matches.sort(key=score, reverse=True)
    return [
        {key: entry[key] for key in ("title", "detail", "kind", "image", "url") if key in entry}
        for entry in matches
    ]


def main():
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    request = json.load(sys.stdin)
    results = search(request["entries"], request["query"], request.get("kind", "All"))
    json.dump({"results": results, "engine": "python"}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
