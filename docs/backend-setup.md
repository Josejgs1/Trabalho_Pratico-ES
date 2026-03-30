# Backend Setup

## Prerequisites

- [Python 3.12+](https://www.python.org/downloads/)

## Installation

1. Create a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   ```

2. Activate it:
   ```bash
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running

```bash
uvicorn app.main:app --reload
```
