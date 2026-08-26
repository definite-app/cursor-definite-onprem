#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await fs.readFile(path.join(root, relativePath), "utf8"));
  } catch (error) {
    fail(`${relativePath}: ${error.message}`);
    return null;
  }
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function referencedVariables(value) {
  const matches = JSON.stringify(value).matchAll(/\$\{([A-Z][A-Z0-9_]*)\}/g);
  return new Set(Array.from(matches, (match) => match[1]));
}

const manifest = await readJson(".cursor-plugin/plugin.json");
const mcp = await readJson("mcp.json");

if (manifest) {
  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name ?? "")) {
    fail("plugin name must be lowercase kebab-case");
  }
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) {
    fail("plugin version must be semantic versioning");
  }
  for (const field of ["displayName", "description", "license"]) {
    if (typeof manifest[field] !== "string" || manifest[field].length === 0) {
      fail(`plugin manifest is missing ${field}`);
    }
  }
  if (!manifest.author || typeof manifest.author.name !== "string") {
    fail("plugin manifest is missing author.name");
  }

  for (const field of ["skills", "mcpServers"]) {
    const value = manifest[field];
    if (typeof value !== "string" || path.isAbsolute(value) || value.includes("..")) {
      fail(`${field} must be a safe relative path`);
    } else if (!(await exists(value))) {
      fail(`${field} points to a missing path: ${value}`);
    }
  }

  const variables = manifest.variables;
  if (variables?.type !== "object" || typeof variables.properties !== "object") {
    fail("variables must be an object JSON Schema with properties");
  } else {
    const hostname = variables.properties.DEFINITE_DEPLOYMENT_HOSTNAME;
    if (hostname?.type !== "string" || hostname.minLength !== 1) {
      fail("DEFINITE_DEPLOYMENT_HOSTNAME must be a non-empty string field");
    }
    if (!variables.required?.includes("DEFINITE_DEPLOYMENT_HOSTNAME")) {
      fail("DEFINITE_DEPLOYMENT_HOSTNAME must be required");
    }
  }

  if (mcp) {
    for (const variable of referencedVariables(mcp)) {
      if (!Object.hasOwn(variables?.properties ?? {}, variable)) {
        fail(`mcp.json references undeclared variable ${variable}`);
      }
      if (!variables?.required?.includes(variable)) {
        fail(`mcp.json variable ${variable} must be required`);
      }
    }
  }
}

if (mcp) {
  const server = mcp.mcpServers?.definite;
  if (!server) {
    fail('mcp.json must define the "definite" server');
  } else {
    if (server.type !== "http") {
      fail('the "definite" MCP server must use HTTP transport');
    }
    if (server.url !== "https://${DEFINITE_DEPLOYMENT_HOSTNAME}/mcp") {
      fail("the MCP URL must be derived only from the deployment hostname");
    }
    for (const forbidden of ["headers", "auth", "command", "args"]) {
      if (Object.hasOwn(server, forbidden)) {
        fail(`the OAuth-discovered remote server must not define ${forbidden}`);
      }
    }
  }
}

const skillPath = "skills/definite-onprem/SKILL.md";
try {
  const skill = await fs.readFile(path.join(root, skillPath), "utf8");
  if (!/^---\n[\s\S]*?^name: definite-onprem\n[\s\S]*?^description: .+\n[\s\S]*?^---\n/m.test(skill)) {
    fail(`${skillPath} is missing required name/description frontmatter`);
  }
} catch (error) {
  fail(`${skillPath}: ${error.message}`);
}

const textFiles = [
  ".cursor-plugin/plugin.json",
  "mcp.json",
  "README.md",
  skillPath,
];
for (const relativePath of textFiles) {
  const content = await fs.readFile(path.join(root, relativePath), "utf8");
  if (/api\.definite\.app|[a-z0-9-]+\.onprem\.definite\.app/i.test(content)) {
    fail(`${relativePath} contains a hardcoded Definite SaaS/customer host`);
  }
  if (/def_[A-Za-z0-9_-]{12,}/.test(content)) {
    fail(`${relativePath} appears to contain a live Definite API token`);
  }
}

if (errors.length > 0) {
  console.error("Validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Validation passed: Cursor manifest, required hostname, OAuth MCP config, skill, and host/token checks.");
