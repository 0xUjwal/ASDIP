"""
File Parser Service
Extracts text content from various file formats (PDF, DOCX, TXT, LOG).
"""

import io
from pathlib import Path


class FileParser:
    """Extracts text from uploaded files based on extension."""

    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".log"}

    def parse(self, filename: str, file_bytes: bytes) -> str:
        ext = Path(filename).suffix.lower()
        if ext not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file type: {ext}. "
                f"Supported: {', '.join(sorted(self.SUPPORTED_EXTENSIONS))}"
            )

        if ext == ".pdf":
            return self._parse_pdf(file_bytes)
        elif ext in (".docx", ".doc"):
            return self._parse_docx(file_bytes)
        else:
            return self._parse_text(file_bytes)

    def _parse_pdf(self, file_bytes: bytes) -> str:
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            pages = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
            return "\n".join(pages)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {e}")

    def _parse_docx(self, file_bytes: bytes) -> str:
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {e}")

    def _parse_text(self, file_bytes: bytes) -> str:
        for encoding in ("utf-8", "latin-1", "cp1252"):
            try:
                return file_bytes.decode(encoding)
            except UnicodeDecodeError:
                continue
        raise ValueError("Unable to decode text file with supported encodings")
