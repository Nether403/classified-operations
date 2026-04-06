import { db, tagsTable, projectsTable, projectTagsTable, projectSectionsTable } from "./index";

async function seed() {
  console.log("Seeding database...");

  const tagRows = await db
    .insert(tagsTable)
    .values([
      { name: "TypeScript", slug: "typescript", category: "language" },
      { name: "React", slug: "react", category: "framework" },
      { name: "Node.js", slug: "nodejs", category: "runtime" },
      { name: "PostgreSQL", slug: "postgresql", category: "database" },
      { name: "AI/ML", slug: "ai-ml", category: "domain" },
      { name: "OpenAI", slug: "openai", category: "service" },
      { name: "WebGL", slug: "webgl", category: "graphics" },
      { name: "Three.js", slug: "threejs", category: "framework" },
      { name: "Rust", slug: "rust", category: "language" },
      { name: "Go", slug: "go", category: "language" },
      { name: "Docker", slug: "docker", category: "infrastructure" },
      { name: "GraphQL", slug: "graphql", category: "api" },
      { name: "Real-time", slug: "real-time", category: "domain" },
      { name: "Generative Art", slug: "generative-art", category: "domain" },
      { name: "Security", slug: "security", category: "domain" },
    ])
    .onConflictDoNothing()
    .returning();

  const tagMap = new Map(tagRows.map((t) => [t.slug, t.id]));

  const projects = [
    {
      title: "Phantom Protocol",
      slug: "phantom-protocol",
      summary:
        "A covert distributed system for real-time anomaly detection across financial networks. Processes 2M events per second with sub-10ms latency using a custom CRDT-based consensus algorithm.",
      classification: "RESTRICTED",
      status: "DEPLOYED",
      year: 2025,
      isPublic: true,
      isFeatured: true,
      techStack: ["Rust", "Kafka", "PostgreSQL", "TimescaleDB", "gRPC"],
      coverImageUrl: null,
      tagSlugs: ["rust", "postgresql", "real-time", "security"],
      sections: [
        {
          type: "overview",
          title: "Mission Brief",
          content:
            "Phantom Protocol was designed to detect coordinated financial fraud patterns invisible to traditional rule-based systems. By modeling transaction graphs as temporal streams and applying custom CRDT consensus, the system achieves near-zero false positive rates while maintaining regulatory compliance.",
          sortOrder: 0,
        },
        {
          type: "technical",
          title: "Architecture",
          content:
            "The system is built around a Rust-based event processor that ingests Kafka streams, applies windowed anomaly scoring, and writes to a TimescaleDB hypertable optimized for time-series queries. gRPC services expose real-time scoring APIs to downstream consumers.",
          sortOrder: 1,
        },
        {
          type: "outcome",
          title: "Results",
          content:
            "Deployed across 3 major financial institutions. Detected $47M in prevented fraud in the first 90 days. Processing latency averaged 7.2ms at peak load.",
          sortOrder: 2,
        },
      ],
    },
    {
      title: "Nexus Intelligence",
      slug: "nexus-intelligence",
      summary:
        "Multimodal AI research assistant that synthesizes insights across scientific literature, patent databases, and proprietary datasets. Built for R&D teams requiring deep cross-domain knowledge synthesis.",
      classification: "CONFIDENTIAL",
      status: "ACTIVE",
      year: 2025,
      isPublic: true,
      isFeatured: true,
      techStack: ["Python", "TypeScript", "OpenAI", "Pinecone", "FastAPI"],
      coverImageUrl: null,
      tagSlugs: ["ai-ml", "openai", "typescript"],
      sections: [
        {
          type: "overview",
          title: "Mission Brief",
          content:
            "Nexus Intelligence transforms how research teams engage with knowledge. Instead of siloed search interfaces, it presents a unified graph of connected concepts, allowing researchers to trace insight lineages and discover non-obvious connections across millions of documents.",
          sortOrder: 0,
        },
        {
          type: "technical",
          title: "Architecture",
          content:
            "Hybrid RAG pipeline with a custom knowledge graph layer. Documents are chunked, embedded with ada-002, and stored in Pinecone with metadata-rich payloads. At query time, a multi-hop graph traversal augments the vector retrieval with relationship context.",
          sortOrder: 1,
        },
        {
          type: "outcome",
          title: "Results",
          content:
            "Beta deployed to 3 pharmaceutical R&D teams. Reduced literature review time by 68%. Surface-to-insight time decreased from 4 days average to 2.3 hours.",
          sortOrder: 2,
        },
      ],
    },
    {
      title: "Obsidian Canvas",
      slug: "obsidian-canvas",
      summary:
        "Real-time generative art engine that responds to audio input, biometric data, and environmental signals. Renders complex particle systems at 120fps using custom WebGL shaders and a novel noise-field algorithm.",
      classification: "UNCLASSIFIED",
      status: "DEPLOYED",
      year: 2024,
      isPublic: true,
      isFeatured: true,
      techStack: ["TypeScript", "WebGL", "GLSL", "Web Audio API", "React"],
      coverImageUrl: null,
      tagSlugs: ["typescript", "webgl", "threejs", "generative-art"],
      sections: [
        {
          type: "overview",
          title: "Mission Brief",
          content:
            "Obsidian Canvas is an exploration of the boundary between computation and perception. It uses real-time audio analysis combined with procedural generation techniques to create visual systems that feel alive — responding not just to sound, but to the emotional contour of music.",
          sortOrder: 0,
        },
        {
          type: "technical",
          title: "Architecture",
          content:
            "A custom WebGL renderer built from scratch implements per-fragment noise evaluation using 4D simplex noise with time as the 4th dimension. The particle system uses transform feedback for GPU-side physics simulation, keeping all computation on the GPU.",
          sortOrder: 1,
        },
        {
          type: "outcome",
          title: "Results",
          content:
            "Exhibited at 3 digital art festivals. Installed as permanent interactive installation at a contemporary art museum in Berlin. Peak simultaneous users: 847.",
          sortOrder: 2,
        },
      ],
    },
    {
      title: "Cipher Gateway",
      slug: "cipher-gateway",
      summary:
        "Zero-knowledge authentication infrastructure for decentralized applications. Implements zk-SNARKs for credential verification without exposing user identity, enabling privacy-preserving access control at scale.",
      classification: "RESTRICTED",
      status: "ACTIVE",
      year: 2024,
      isPublic: true,
      isFeatured: false,
      techStack: ["Go", "Solidity", "TypeScript", "circom", "snarkjs"],
      coverImageUrl: null,
      tagSlugs: ["go", "security", "typescript"],
      sections: [
        {
          type: "overview",
          title: "Mission Brief",
          content:
            "Cipher Gateway solves the fundamental tension between decentralized identity and privacy. Traditional Web3 auth exposes wallet addresses; Cipher Gateway allows users to prove attributes about themselves (age, membership, credentials) without revealing their identity.",
          sortOrder: 0,
        },
        {
          type: "technical",
          title: "Architecture",
          content:
            "Groth16 proof system implemented in circom with a Golang verifier service. The client-side prover runs in WASM, generating proofs in ~800ms on modern hardware. Smart contracts on EVM chains handle on-chain verification.",
          sortOrder: 1,
        },
        {
          type: "outcome",
          title: "Results",
          content:
            "Integrated by 4 DeFi protocols. 12,000+ unique proofs generated. Proof generation time reduced to 340ms after optimizations. Security audit completed with no critical findings.",
          sortOrder: 2,
        },
      ],
    },
    {
      title: "Meridian Grid",
      slug: "meridian-grid",
      summary:
        "Distributed energy management platform that coordinates EV charging, solar generation, and battery storage across commercial facilities. Reduces peak demand charges by 31% through ML-driven load forecasting.",
      classification: "UNCLASSIFIED",
      status: "DEPLOYED",
      year: 2024,
      isPublic: true,
      isFeatured: false,
      techStack: ["Python", "TypeScript", "React", "PostgreSQL", "MQTT"],
      coverImageUrl: null,
      tagSlugs: ["typescript", "react", "postgresql", "real-time"],
      sections: [
        {
          type: "overview",
          title: "Mission Brief",
          content:
            "Meridian Grid addresses the growing complexity of commercial energy management as facilities add EV charging infrastructure and on-site renewable generation. The platform creates a unified control layer that optimizes across all assets in real-time.",
          sortOrder: 0,
        },
        {
          type: "technical",
          title: "Architecture",
          content:
            "MQTT broker collects real-time telemetry from 400+ devices per facility. A Python-based forecasting engine uses gradient boosted trees trained on 3 years of historical data. React dashboard provides operators with live grid state visualization.",
          sortOrder: 1,
        },
        {
          type: "outcome",
          title: "Results",
          content:
            "Deployed across 23 commercial facilities in 3 states. Average peak demand reduction: 31%. Annual energy cost savings per facility: $127,000. ROI achieved in 14 months.",
          sortOrder: 2,
        },
      ],
    },
    {
      title: "Atlas Query",
      slug: "atlas-query",
      summary:
        "Natural language interface for enterprise data warehouses. Converts plain English questions into optimized SQL, with automatic schema discovery, query explanation, and result visualization. Supports BigQuery, Snowflake, and Redshift.",
      classification: "CONFIDENTIAL",
      status: "BETA",
      year: 2025,
      isPublic: true,
      isFeatured: false,
      techStack: ["TypeScript", "Python", "OpenAI", "React", "GraphQL"],
      coverImageUrl: null,
      tagSlugs: ["typescript", "ai-ml", "openai", "graphql", "react"],
      sections: [
        {
          type: "overview",
          title: "Mission Brief",
          content:
            "Atlas Query democratizes data access within enterprises. Non-technical stakeholders can ask business questions in plain English and receive accurate, explainable answers backed by live data — without needing to know SQL or wait for analyst bandwidth.",
          sortOrder: 0,
        },
        {
          type: "technical",
          title: "Architecture",
          content:
            "Schema-aware prompt construction feeds GPT-4 with relevant table and column metadata, reducing hallucination rates significantly. Generated SQL is sandboxed and validated before execution. Results are automatically typed and formatted for the most appropriate visualization.",
          sortOrder: 1,
        },
        {
          type: "outcome",
          title: "Results",
          content:
            "Beta with 6 enterprise customers. Query accuracy: 94.2% on benchmark set. Analyst ticket volume reduced by 41%. Average time-to-insight: 47 seconds vs 3.2 days manual.",
          sortOrder: 2,
        },
      ],
    },
  ];

  for (const project of projects) {
    const { tagSlugs, sections, ...projectData } = project;

    const [inserted] = await db
      .insert(projectsTable)
      .values(projectData)
      .onConflictDoNothing()
      .returning();

    if (!inserted) {
      console.log(`Project "${project.title}" already exists, skipping`);
      continue;
    }

    const validTagIds = tagSlugs
      .map((s) => tagMap.get(s))
      .filter((id): id is number => id !== undefined);

    if (validTagIds.length > 0) {
      await db
        .insert(projectTagsTable)
        .values(validTagIds.map((tagId) => ({ projectId: inserted.id, tagId })))
        .onConflictDoNothing();
    }

    if (sections.length > 0) {
      await db
        .insert(projectSectionsTable)
        .values(sections.map((s) => ({ ...s, projectId: inserted.id })))
        .onConflictDoNothing();
    }

    console.log(`Created project: ${project.title}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
