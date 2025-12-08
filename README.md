# Semantic Intent Routing Engine

A lightweight, fast, and fully deterministic alternative to traditional intent-classification systems.  
Built with **React + Vite + Tailwind** on the frontend and a **Python-based semantic inference engine** on the backend.

This system routes user queries through a graph of intents using sentence embeddings, adaptive confidence logic, and retrieval-based fallbacks—no classifiers, training loops, or model deployments required.

---

## Features

### **Deterministic Intent Resolution**
Resolves user queries by traversing a DAG-structured intent graph with path-level scoring instead of a single classifier.

### **Adaptive Confidence Thresholding**
Automatically adjusts sensitivity based on query length and phrasing, improving routing stability on ambiguous inputs.

### **Retrieval-Augmented Fallbacks**
When a query doesn’t clearly match any intent, the system fetches semantically similar candidates and recovers gracefully.

### **Multi-Turn Context Handling**
Maintains conversational context so follow-up questions like “same as before” or “for that” route correctly without repeating selections.

### **Hot-Swappable Intent Graph**
Intents are defined in JSON and automatically converted into a navigable graph.  
Updates apply instantly—no retraining or redeployment required.

### **Fast and Lightweight**
Runs entirely on CPU and maintains **sub-15ms routing latency** thanks to caching and optimized traversal.

---

## Architecture Overview

- **Frontend:** React + Vite + Tailwind interface for entering queries and testing the routing behavior.  
- **Backend:** Python engine using sentence-transformer embeddings and deterministic traversal logic.  
- **Intent Graph:** JSON-defined structure supporting multi-parent nodes, examples, responses, and metadata.

---

## Why This Exists

Most NLU systems rely on classifiers or fine-tuned models, which brings problems like:

- retraining loops  
- model drift  
- slow iteration cycles  
- low explainability  

This project avoids all of that by using semantic similarity, graph traversal, and context tracking to produce stable and predictable routing—even as intents change.
