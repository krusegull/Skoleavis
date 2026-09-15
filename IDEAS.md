# Idéer og fremtidige funksjoner

Løpende liste over idéer Eirik har kommet med, som ikke er bygget ennå.
Ikke en forpliktende plan - bare et sted å samle ting så de ikke forsvinner.

## Ikke startet

- **Nyhetstips/AI-utkast for elever.** Redaktør/Admin har nå (se
  "Gjennomført") et valg om AI skal skrive et førsteutkast fra et
  nyhetstips. Eirik har sagt at dette bør fungere annerledes når elever
  er de som bruker det - uavklart foreløpig hvordan (skal elever se
  tipsene selv? Få AI-hjelp til å skrive, eller skal det være forbeholdt
  voksne? Kommer tilbake til dette.)

## Vurdert, ikke prioritert

*(ingen ennå)*

## Gjennomført

- **AI-agent som leter etter nyheter** (2026-09-15, utvidet 2026-09-15).
  Kjører ukentlig, hver torsdag (Vercel Cron), og bruker Claude med
  web-søk til å finne troverdige nyhetssaker fra siste uke - først og
  fremst Stovner/Østkanten i Oslo, deretter store nasjonale nyheter.
  Under **Dashbord → Nyhetstips** (kun Redaktør/Admin) kan de velge
  "Skriv utkast for meg" (Claude skriver et originalt førsteutkast med
  web-søk for faktasjekk, tydelig merket som AI-generert, går gjennom
  vanlig godkjenningsflyt), "Jeg skriver selv" (tom kladd), eller
  "Avvis". Se README "Nyhetstips" for oppsett.
