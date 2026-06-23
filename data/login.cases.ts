import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

/** One row of the CSV-driven login matrix. */
export type CsvLoginCase = {
  label: string
  username: string
  password: string
  expectedStatus: number
  expectToken: boolean
}

/**
 * Data-driven login cases loaded from an EXTERNAL CSV file
 * (`data/login.cases.csv`).
 *
 * Same data-driven pattern as `auth.dataset.ts`, but the data lives in a format
 * a non-developer (manual QA, analyst) can edit in a spreadsheet — the classic
 * "here's a CSV of cases" hand-off. Pure strings/numbers; no code, no faker.
 *
 * CSV preserves surrounding whitespace by default, which is exactly what the
 * "username with surrounding spaces" row needs to assert the app does NOT trim.
 */
const file = path.join(__dirname, 'login.cases.csv')

type RawRow = Record<string, string>

const rows = parse(readFileSync(file, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
}) as RawRow[]

export const csvLoginCases: CsvLoginCase[] = rows.map((row) => ({
  label: row.label,
  username: row.username,
  password: row.password,
  expectedStatus: Number(row.expectedStatus),
  expectToken: row.expectToken === 'true',
}))
