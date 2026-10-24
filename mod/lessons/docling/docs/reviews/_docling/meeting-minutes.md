## MEETING MINUTES

## Product committee· Tailspin Toys

Date: October 14, 2026, from 10:00 to11:00

Place: Triana room, Seville office

Attendees: Lucía Romero (product), Andrés Vega (web team),

Marta Ibáñez (data) and Pablo Ortega (QA)

## 1. Status of sprint 14

The web team closes every task of the sprint. The end-to-end tests pass against the built site.

## 2. Game ratings

Several users can't tell half stars apart. The proposal is to replace them with a numeric score, which is easier to compare.

## 3. Database

The committee reviews whether to change the database. The catalog is small and loads from games.csv, so there is no need.

## Decisions

- D1. SQLite remains the database of the catalog.
- D2. Game ratings are shown on a scale of 1 to 10, as whole numbers and without stars. Implemented in sprint 14.
- D3. The "Support This Game" button still does not process contributions until the payment gatewayis chosen.

## Actions

- Lucía Romero: update the requirements specification (v1.3) with decision D2. Before 2026-10-30.
- Pablo Ortega: prepare the test plan of version 1.3. Before 2026-11-06.

Signed: Lucía Romero, secretary of the committee

<!-- image -->
