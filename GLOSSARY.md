# Glosario

## Workshop

La sesión práctica completa (3 h oficiales) impartida en los GitHub Copilot Dev Days de Sevilla: el **workshop base** más el **mod**, recorridos según el **itinerario**. Lo que los asistentes no terminen en la sesión, lo completan en casa.

_Evitar_: workflow (para referirse al workshop).

## Workshop base

El workshop publicado oficialmente en los Dev Days (https://dev-days.github.com/#workshops) sobre el que se apoya este **workshop**. Se usa tal cual, sin reescribir ni traducir sus lecciones.

## Mod

Lo que este repo publica para modificar el **workshop base** sin tocarlo: las **lecciones propias**, los **prerrequisitos extra** y el material que estas necesitan.

_Evitar_: fork, plantilla (el mod no copia la base).

## Itinerario

Secuencia ordenada de lecciones base y **lecciones propias** que se sigue en una sesión concreta, incluidas las lecciones base que se saltan.

_Evitar_: agenda (la agenda reparte tiempos; el itinerario fija el orden).

## Lección

Bloque autocontenido del **workshop** con un objetivo de aprendizaje propio. Equivale a las _lessons_ / _exercises_ de los workshops publicados.

## Lección propia

**Lección** publicada en el **mod**. Es *sustituta* si ocupa el lugar de una lección base, *intercalada* si se inserta entre dos lecciones base, o **lección extra**.

## Prerrequisitos extra

Lo que el asistente hace en casa, después de los prerrequisitos de la base y antes de venir, para preparar el **mod**: instalar Docling y traer el material de las **lecciones propias**.

## Lección extra

**Lección** avanzada y opcional, situada al final, pensada para hacerse en casa. Aloja lo de mayor complejidad que no encaja con un público junior dentro de las 3 h.

## Engineering Reviewer

El agente (con sus skills y herramientas) que los asistentes construyen durante las **lecciones propias** para analizar conjuntamente la documentación y el código de la app del **workshop base** y detectar inconsistencias entre requisitos, arquitectura e implementación.

_Evitar_: repo a revisar (nombrar la app: Tailspin Toys).

## Skill

Conjunto de instrucciones reutilizable que describe **cómo hacer** una tarea concreta. El agente la carga solo cuando la necesita y es portable entre herramientas (Copilot, Claude Code...).

_Evitar_: agente (para referirse a una skill).

## Custom agent

**Rol** con su propio conjunto de herramientas permitidas y su propio contexto, que puede apoyarse en **skills**. En Claude Code, el equivalente es un _subagent_. El **Engineering Reviewer** es un custom agent.

_Evitar_: chat mode (nombre antiguo), skill (no restringe herramientas ni aísla el contexto).

## Inconsistencia sembrada

Error introducido a propósito en el material que el **mod** añade a Tailspin Toys (diagramas, documentos) para que el **Engineering Reviewer** lo detecte al contrastarlo con el código o los requisitos.

_Evitar_: bug, error (sin más: no es un fallo del código, sino una discrepancia deliberada entre fuentes).

## Flujo de Matt Pocock

La metodología de trabajo con agentes que proponen las skills de https://github.com/mattpocock/skills (afinar la idea mediante preguntas, convertirla en issues, implementar con TDD...).

_Evitar_: workflow (ambiguo con **workshop**).
