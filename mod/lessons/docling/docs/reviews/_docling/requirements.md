## Tailspin Toys · Catalog Requirements Specification

v1.2 · September 30, 2026 · Status: approved by the product committee

|   Version | Date       | Changes                                |
|-----------|------------|----------------------------------------|
|       1.0 | 2026-05-12 | First approved version.                |
|       1.1 | 2026-07-03 | Adds the detail page and the 404 page. |
|       1.2 | 2026-09-30 | Adds sections 4 and 5.                 |

## 1. Introduction

Tailspin Toys is a crowdfunding platform for board games themed around software development. This document sets out the requirements of the catalog website: what it must show and to what quality. The product team maintains it, and the web team uses it as its reference.

## 2. Glossary

Game: Board game themed around software development that seeks funding on the platform.

Category: Genre of the game, such as Strategy, Card Game or Puzzle. It groups the catalog.

Publisher: Studio or company that publishes the game and asks for the funding.

Rating: Score of the game. It is optional: a new game may not have one.

## 3. Functional requirements

- FR-01. The home page shows every game in the catalog, sorted alphabetically by title.
- FR-02. Each card in the catalog shows the title, the categories, the publisher and the start of the description, and links to the detail page of the game.
- FR-03. A game can belong to several categories. The card and the detail page show all the categories of the game.
- FR-04. Each game has exactly one publisher.
- FR-05. The detail page of each game is at the route /game/{id} and shows the title, the rating, the categories, the publisher and the full description.
- FR-06. The detail page includes the "Support This Game" button. In this version the button does not process contributions (see section 5).
- FR-07. If a game has no rating, its detail page shows no rating.
- FR-08. The site includes an "About" page that introduces Tailspin Toys.
- FR-09. A route that does not exist shows a 404 page with the design of the site.

## 4. Non-functional requirements

- NFR-01. The catalog updates in real time: any change to the data of a game shows on the website in less than 5 seconds, without redeploying the site.
- NFR-02. The catalog data is stored in a local SQLite database, loaded from the games.csv file.
- NFR-03. The rating of each game is computed deterministically, so that two builds of the site produce the same result.
- NFR-04. The site meets WCAG 2.1 level AA and can be fully navigated with the keyboard.
- NFR-05. The catalog adapts to the screen width: one column on mobile, two on tablet and three on desktop.
- NFR-06. Unit tests cover the data layer, and end-to-end tests run against the built site.

## 5. Out of scope

This version does not include:

- Search, filtering, sorting and pagination of the catalog: they are planned for version 1.3.
- Pages of their own for each publisher.
- Processing contributions and a payment gateway.
- User accounts and user ratings.
