"""
Regex patterns for sensitive data detection.
Each pattern maps to a finding type with its associated risk level.
"""

import re

SENSITIVE_PATTERNS = {
    "email": {
        "pattern": re.compile(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        ),
        "risk": "low",
        "label": "Email address",
    },
    "phone": {
        "pattern": re.compile(
            r"\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b"
        ),
        "risk": "low",
        "label": "Phone number",
    },
    "api_key": {
        "pattern": re.compile(
            r"(?i)(?:api[_-]?key|apikey|api_secret|access[_-]?key)"
            r"[\s]*[=:]\s*['\"]?([A-Za-z0-9\-_]{16,})['\"]?"
        ),
        "risk": "high",
        "label": "API key",
    },
    "api_key_value": {
        "pattern": re.compile(
            r"\b(?:sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|"
            r"glpat-[A-Za-z0-9\-_]{20,}|xox[bsap]-[A-Za-z0-9\-]{10,})\b"
        ),
        "risk": "high",
        "label": "API key (well-known format)",
        "type_override": "api_key",
    },
    "password": {
        "pattern": re.compile(
            r"(?i)(?:password|passwd|pwd|pass)[\s]*[=:]\s*['\"]?(\S+)['\"]?"
        ),
        "risk": "critical",
        "label": "Password",
    },
    "token": {
        "pattern": re.compile(
            r"(?i)(?:token|bearer|auth[_-]?token|access[_-]?token|refresh[_-]?token)"
            r"[\s]*[=:]\s*['\"]?([A-Za-z0-9\-_.]{16,})['\"]?"
        ),
        "risk": "high",
        "label": "Authentication token",
    },
    "secret": {
        "pattern": re.compile(
            r"(?i)(?:secret|client[_-]?secret|private[_-]?key|secret[_-]?key)"
            r"[\s]*[=:]\s*['\"]?([A-Za-z0-9\-_/+=]{8,})['\"]?"
        ),
        "risk": "critical",
        "label": "Secret/Private key",
    },
    "credit_card": {
        "pattern": re.compile(
            r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|"
            r"3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b"
        ),
        "risk": "critical",
        "label": "Credit card number",
    },
    "stack_trace": {
        "pattern": re.compile(
            r"(?i)(?:stack\s*trace|traceback|exception|"
            r"at\s+[\w$.]+\([\w]+\.\w+:\d+\)|"
            r"File\s+\"[^\"]+\",\s+line\s+\d+|"
            r"NullPointerException|IndexOutOfBoundsException|"
            r"TypeError|ValueError|RuntimeError|SegmentationFault)"
        ),
        "risk": "medium",
        "label": "Stack trace / Error leak",
    },
    "sql_injection": {
        "pattern": re.compile(
            r"(?i)(?:(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\s+"
            r"(?:.*\s+)?(?:FROM|INTO|TABLE|SET|ALL)\s+|"
            r"(?:--|;)\s*(?:DROP|DELETE|UPDATE|INSERT))"
        ),
        "risk": "high",
        "label": "Potential SQL injection",
    },
    "debug_leak": {
        "pattern": re.compile(
            r"(?i)(?:DEBUG\s*[:=]\s*(?:true|1|on|yes)|"
            r"debug\s+mode\s+(?:enabled|active|on)|"
            r"VERBOSE\s*[:=]\s*(?:true|1))"
        ),
        "risk": "medium",
        "label": "Debug mode leak",
    },
}

BRUTE_FORCE_PATTERN = re.compile(
    r"(?i)(?:failed\s+(?:login|auth)|login\s+fail|"
    r"authentication\s+(?:failed|error)|invalid\s+(?:password|credentials)|"
    r"unauthorized|401\s+)"
)

SUSPICIOUS_IP_PATTERN = re.compile(
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
)

LOG_LEVEL_PATTERN = re.compile(
    r"\b(DEBUG|INFO|WARN(?:ING)?|ERROR|FATAL|CRITICAL|TRACE)\b"
)

TIMESTAMP_PATTERN = re.compile(
    r"\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}:\d{2}"
)
