# Web Uni Project 2025 — Thesis Management Web Application

A full-stack university web application for managing undergraduate theses, connecting a relational SQL database (`diplomatikes_db.sql`) and Node.js backend (`server.js`) with a role-based frontend (`public/`) for students, instructors, and secretariat staff.

## Project Structure

```text
├── public/                                # Frontend HTML, CSS, client scripts, and assets
│   ├── css/
│   │   ├── reset.css
│   │   └── style.css
│   ├── index.html                         # Login & landing page
│   ├── foititis.html                      # Student portal
│   ├── didaskon.html                      # Instructor / supervisor portal
│   ├── grammateia.html                    # Secretariat portal
│   └── header.html
├── server.js                              # Node.js / Express backend & API routes
├── diplomatikes_db.sql                    # Relational database schema
├── inserts.sql                            # Initial seed data
├── insert_grammateia.json                 # Sample secretariat import dataset
├── BashDedomenwnProjectWebERVer5.drawio.png  # Entity-Relationship (ER) diagram
└── package.json

Database & System Overview

    Relational Database (diplomatikes_db.sql): Models students, faculty supervisors, three-member examination committees, thesis topics, status lifecycles, and final grading records.

    Backend (server.js): Serves static frontend assets from public/ and exposes REST/AJAX endpoints for authentication, thesis assignments, committee management, and CSV/JSON data exports.

    Role-Based Portals (public/): Dedicated interfaces for students (foititis.html), instructors (didaskon.html), and secretariat administration (grammateia.html).