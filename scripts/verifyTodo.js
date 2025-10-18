#!/usr/bin/env node
/**
 * todo.md verification helper.
 * Evaluates automation/todo-checks.json and reports failing tasks.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const configPath = path.join(projectRoot, "automation", "todo-checks.json");

if (!fs.existsSync(configPath)) {
  console.error(`Configuration file not found: ${configPath}`);
  process.exit(1);
}

/** @typedef {{ id: string, description: string, checks: Array<Check> }} Task */
/** @typedef {{ type: string, path: string, includes?: string[], keys?: string[], jsonPath?: string[], equals?: any, categories?: string[], pattern?: string }} Check */

/** @type {{ version: number, tasks: Task[] }} */
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const failures = [];
const warnings = [];

for (const task of config.tasks) {
  const taskFailures = [];
  for (const check of task.checks) {
    try {
      runCheck(check);
    } catch (error) {
      taskFailures.push(formatError(error));
    }
  }
  if (taskFailures.length > 0) {
    failures.push({
      taskId: task.id,
      description: task.description,
      failures: taskFailures,
    });
  }
}

if (failures.length === 0) {
  console.log("✅ All todo items satisfied according to automation/todo-checks.json.");
  process.exit(0);
} else {
  console.log("🚫 Unmet todo checks detected:");
  for (const failure of failures) {
    console.log(`\n[${failure.taskId}] ${failure.description}`);
    for (const message of failure.failures) {
      console.log(`  - ${message}`);
    }
  }
  process.exit(1);
}

/**
 * Dispatches a concrete check.
 * @param {Check} check
 */
function runCheck(check) {
  switch (check.type) {
    case "fileExists":
      assertFileExists(check.path);
      break;
    case "fileIncludes":
      assertFileIncludes(check.path, check.includes || []);
      break;
    case "jsonHasKeys":
      assertJsonHasKeys(check.path, check.keys || []);
      break;
    case "jsonValue":
      assertJsonValue(check.path, check.jsonPath || [], check.equals);
      break;
    case "yamlHasCategories":
      assertYamlCategories(check.path, check.categories || []);
      break;
    case "directoryPattern":
      assertDirectoryPattern(check.path, check.pattern);
      break;
    default:
      throw new Error(`Unknown check type "${check.type}" for path "${check.path}".`);
  }
}

function resolveProjectPath(relativePath) {
  return path.join(projectRoot, relativePath);
}

function assertFileExists(relativePath) {
  const resolved = resolveProjectPath(relativePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
}

function assertFileIncludes(relativePath, includes) {
  assertFileExists(relativePath);
  const resolved = resolveProjectPath(relativePath);
  const content = fs.readFileSync(resolved, "utf8");
  for (const needle of includes) {
    if (!content.includes(needle)) {
      throw new Error(`File ${relativePath} is missing expected content: "${needle}"`);
    }
  }
}

function assertJsonHasKeys(relativePath, keys) {
  assertFileExists(relativePath);
  const resolved = resolveProjectPath(relativePath);
  const data = JSON.parse(fs.readFileSync(resolved, "utf8"));
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      throw new Error(`JSON file ${relativePath} missing key: ${key}`);
    }
  }
}

function assertJsonValue(relativePath, jsonPath, expected) {
  assertFileExists(relativePath);
  const resolved = resolveProjectPath(relativePath);
  const data = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const value = getByPath(data, jsonPath);
  if (value !== expected) {
    throw new Error(
      `JSON value mismatch at ${relativePath} ${jsonPath.join(".")}: expected ${JSON.stringify(
        expected
      )}, received ${JSON.stringify(value)}`
    );
  }
}

function assertYamlCategories(relativePath, categories) {
  assertFileExists(relativePath);
  const resolved = resolveProjectPath(relativePath);
  const content = fs.readFileSync(resolved, "utf8");
  const keys = extractTopLevelYamlKeys(content);
  const missing = categories.filter((category) => !keys.has(category));
  if (missing.length > 0) {
    throw new Error(`YAML file ${relativePath} missing categories: ${missing.join(", ")}`);
  }
}

function assertDirectoryPattern(relativePath, pattern) {
  const resolved = resolveProjectPath(relativePath);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error(`Directory not found: ${relativePath}`);
  }
  if (!pattern) {
    return;
  }
  const regex = new RegExp(pattern);
  const entries = fs.readdirSync(resolved);
  if (!entries.some((entry) => regex.test(entry))) {
    throw new Error(`No entries in ${relativePath} match pattern ${pattern}`);
  }
}

function getByPath(data, pathSegments) {
  return pathSegments.reduce((acc, segment) => (acc === undefined ? acc : acc[segment]), data);
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function extractTopLevelYamlKeys(content) {
  const keys = new Set();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = /^([A-Za-z0-9_\-]+):/.exec(line.trim());
    if (match) {
      keys.add(match[1]);
    }
  }
  return keys;
}
