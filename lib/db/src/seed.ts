import { db, tagsTable, projectsTable, projectTagsTable, projectSectionsTable, mediaAssetsTable, vaultNotesTable } from "./index";

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
      { name: "Data Viz", slug: "data-viz", category: "domain" },
      { name: "Design Systems", slug: "design-systems", category: "domain" },
    ])
    .onConflictDoNothing()
    .returning();

  const tagMap = new Map(tagRows.map((t) => [t.slug, t.id]));

  const projects = [
    {
      title: "Nexus Intelligence",
      slug: "nexus-intelligence",
      category: "AI System",
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
          type: "problem",
          title: "Problem",
          content:
            "R&D teams at large pharmaceutical and biotech firms spend 40–60% of their research time on literature review and knowledge discovery — a slow, siloed process that misses non-obvious connections across disciplines. Existing search tools are domain-specific and return documents, not synthesized insight.",
          sortOrder: 0,
        },
        {
          type: "approach",
          title: "Approach",
          content:
            "Built a hybrid RAG pipeline with a custom knowledge graph layer. Documents are chunked, embedded with text-embedding-3-large, and stored in Pinecone with metadata-rich payloads. At query time, a multi-hop graph traversal augments vector retrieval with relationship context, enabling insight synthesis across previously unconnected sources.",
          sortOrder: 1,
        },
        {
          type: "key_decisions",
          title: "Key Decisions",
          content:
            "Chose knowledge graph augmentation over pure vector search to capture explicit relationship semantics. Used GPT-4 for synthesis rather than retrieval to preserve source attribution. Built a streaming response architecture to give users incremental insight while deeper retrieval runs in parallel.",
          sortOrder: 2,
        },
        {
          type: "outcomes",
          title: "Outcomes",
          content:
            "Beta deployed to 3 pharmaceutical R&D teams. Reduced literature review time by 68%. Surface-to-insight time decreased from 4 days average to 2.3 hours. One team identified a previously unknown drug interaction that became the basis for a patent filing.",
          sortOrder: 3,
        },
      ],
      media: [
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Knowledge graph visualization", sortOrder: 0 },
        { type: "demo", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Multi-hop synthesis demo", sortOrder: 1 },
      ],
    },
    {
      title: "Meridian Grid",
      slug: "meridian-grid",
      category: "Web App",
      summary:
        "Distributed energy management platform that coordinates EV charging, solar generation, and battery storage across commercial facilities. Reduces peak demand charges by 31% through ML-driven load forecasting.",
      classification: "UNCLASSIFIED",
      status: "DEPLOYED",
      year: 2024,
      isPublic: true,
      isFeatured: true,
      techStack: ["Python", "TypeScript", "React", "PostgreSQL", "MQTT"],
      coverImageUrl: null,
      tagSlugs: ["typescript", "react", "postgresql", "real-time"],
      sections: [
        {
          type: "problem",
          title: "Problem",
          content:
            "Commercial facilities adding EV charging infrastructure and on-site renewables faced an increasingly complex energy management problem: multiple asset types, competing priorities, and utility rate structures with punishing peak demand charges. Existing building management systems were siloed and reactive.",
          sortOrder: 0,
        },
        {
          type: "approach",
          title: "Approach",
          content:
            "Designed a unified control layer with MQTT-based real-time telemetry from all facility devices, a gradient-boosted ML forecasting engine, and a constraint-based optimizer that dispatches charging and storage decisions 15 minutes ahead of real-time. A React dashboard gives operators full visibility into grid state and override capability.",
          sortOrder: 1,
        },
        {
          type: "key_decisions",
          title: "Key Decisions",
          content:
            "Used MQTT over REST for device communication to handle intermittent connectivity and bursty telemetry at scale. Chose gradient boosting over deep learning for interpretability — facility operators need to understand why the system made a decision. Built the forecasting model to retrain nightly on rolling 90-day windows.",
          sortOrder: 2,
        },
        {
          type: "outcomes",
          title: "Outcomes",
          content:
            "Deployed across 23 commercial facilities in 3 states. Average peak demand reduction: 31%. Annual energy cost savings per facility: $127,000. ROI achieved in 14 months. One facility achieved net-zero energy consumption during 6 summer months.",
          sortOrder: 3,
        },
      ],
      media: [
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Live grid state dashboard", sortOrder: 0 },
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Demand forecasting view", sortOrder: 1 },
      ],
    },
    {
      title: "Obsidian Canvas",
      slug: "obsidian-canvas",
      category: "Immersive Interface",
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
          type: "problem",
          title: "Problem",
          content:
            "Digital art installations typically respond to input in simplistic, literal ways — audio waveforms mapped directly to visual parameters. This creates a mechanical, predictable quality that lacks the emotional resonance of live performance. The challenge was creating a system that felt genuinely reactive and alive.",
          sortOrder: 0,
        },
        {
          type: "approach",
          title: "Approach",
          content:
            "Built a custom WebGL renderer implementing per-fragment 4D simplex noise with time as the 4th dimension. Audio analysis runs via Web Audio API FFT, with energy and spectral features driving noise field parameters rather than visual properties directly. The particle system uses transform feedback for GPU-side physics simulation.",
          sortOrder: 1,
        },
        {
          type: "key_decisions",
          title: "Key Decisions",
          content:
            "Mapped audio features to noise field parameters (not direct visual values) to create emergent visual behavior. Used GPU-side transform feedback to keep particle physics off the CPU entirely, enabling 500K+ particles at 120fps. Designed a calibration system so the engine adapts to each physical venue's lighting and acoustics.",
          sortOrder: 2,
        },
        {
          type: "outcomes",
          title: "Outcomes",
          content:
            "Exhibited at 3 digital art festivals. Installed as a permanent interactive installation at a contemporary art museum in Berlin. Peak simultaneous users: 847. The installation ran for 14 months without a single system failure.",
          sortOrder: 3,
        },
      ],
      media: [
        { type: "video", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Live installation footage", sortOrder: 0 },
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Particle field close-up", sortOrder: 1 },
      ],
    },
    {
      title: "Cipher Gateway",
      slug: "cipher-gateway",
      category: "Design System",
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
          type: "problem",
          title: "Problem",
          content:
            "Decentralized applications require verifiable credentials but traditional Web3 authentication exposes wallet addresses publicly. This creates a fundamental tension: dApps need to verify user attributes (age, membership tier, jurisdiction) without storing or revealing sensitive identity data on-chain.",
          sortOrder: 0,
        },
        {
          type: "approach",
          title: "Approach",
          content:
            "Implemented Groth16 proof system in circom with a Go verifier service. The client-side prover runs compiled to WASM, generating proofs locally in the browser. Smart contracts on EVM chains handle on-chain verification using minimal gas. An SDK abstracts the entire flow behind a three-line integration API.",
          sortOrder: 1,
        },
        {
          type: "key_decisions",
          title: "Key Decisions",
          content:
            "Chose Groth16 over PLONK for smaller proof size — critical for on-chain verification costs. Moved proof generation to the client (WASM) to ensure private inputs never leave the user's device. Built a circuit registry pattern so new credential types can be added without redeploying the core verification infrastructure.",
          sortOrder: 2,
        },
        {
          type: "outcomes",
          title: "Outcomes",
          content:
            "Integrated by 4 DeFi protocols handling $2.1B in TVL. 12,000+ unique proofs generated. Proof generation time reduced to 340ms after optimizations. Security audit completed by Trail of Bits with no critical findings.",
          sortOrder: 3,
        },
      ],
      media: [
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "ZK proof flow diagram", sortOrder: 0 },
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "SDK integration example", sortOrder: 1 },
      ],
    },
    {
      title: "Atlas Query",
      slug: "atlas-query",
      category: "Data Visualization",
      summary:
        "Natural language interface for enterprise data warehouses. Converts plain English questions into optimized SQL, with automatic schema discovery, query explanation, and result visualization. Supports BigQuery, Snowflake, and Redshift.",
      classification: "CONFIDENTIAL",
      status: "BETA",
      year: 2025,
      isPublic: true,
      isFeatured: false,
      techStack: ["TypeScript", "Python", "OpenAI", "React", "GraphQL"],
      coverImageUrl: null,
      tagSlugs: ["typescript", "ai-ml", "openai", "graphql", "react", "data-viz"],
      sections: [
        {
          type: "problem",
          title: "Problem",
          content:
            "Enterprise data is locked behind SQL expertise. Non-technical stakeholders wait days for analyst bandwidth to answer business questions that could be answered in seconds with the right interface. Meanwhile, data teams are buried in ad-hoc requests that crowd out strategic work.",
          sortOrder: 0,
        },
        {
          type: "approach",
          title: "Approach",
          content:
            "Built a schema-aware prompt construction system that feeds the language model relevant table and column metadata before query generation. Generated SQL is sandboxed, validated against a schema graph, and explained in plain English before execution. Results are automatically typed and rendered as the most appropriate visualization.",
          sortOrder: 1,
        },
        {
          type: "key_decisions",
          title: "Key Decisions",
          content:
            "Used metadata injection over fine-tuning to handle arbitrary enterprise schemas without retraining. Built a query sandbox that validates SQL before execution to prevent runaway queries. Implemented result-type inference so charts appear automatically — users should not have to choose a visualization type.",
          sortOrder: 2,
        },
        {
          type: "outcomes",
          title: "Outcomes",
          content:
            "Beta with 6 enterprise customers across finance and logistics. Query accuracy: 94.2% on internal benchmark set. Analyst ticket volume reduced by 41%. Average time-to-insight: 47 seconds vs 3.2 days manual. One customer credited the tool with a pricing decision that recovered $3.4M in lost margin.",
          sortOrder: 3,
        },
      ],
      media: [
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Query interface with result chart", sortOrder: 0 },
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Schema discovery visualization", sortOrder: 1 },
      ],
    },
    {
      title: "Phantom Protocol",
      slug: "phantom-protocol",
      category: "Speculative Product",
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
          type: "problem",
          title: "Problem",
          content:
            "Financial fraud has evolved beyond what rule-based detection systems can catch. Coordinated fraud rings deliberately stay below per-transaction thresholds while exploiting patterns across thousands of accounts simultaneously. The signal exists in the graph structure of transactions, not in individual values.",
          sortOrder: 0,
        },
        {
          type: "approach",
          title: "Approach",
          content:
            "Modeled the transaction stream as a temporal graph and built a Rust-based event processor that ingests Kafka streams at 2M events/second, applies windowed anomaly scoring across connected subgraphs, and uses a custom CRDT-based consensus algorithm to coordinate detection signals across distributed nodes. Results are written to TimescaleDB hypertables for time-series query optimization.",
          sortOrder: 1,
        },
        {
          type: "key_decisions",
          title: "Key Decisions",
          content:
            "Chose Rust for the event processor to guarantee memory safety without GC pauses — critical for sub-10ms latency targets. Implemented CRDT consensus to avoid distributed locking, which would have introduced unpredictable latency spikes. Designed the scoring algorithm to be auditable by compliance teams without exposing proprietary detection logic.",
          sortOrder: 2,
        },
        {
          type: "outcomes",
          title: "Outcomes",
          content:
            "Deployed across 3 major financial institutions. Processing latency averaged 7.2ms at peak load. $47M in prevented fraud detected in the first 90 days. Zero false positives on legitimate high-value transactions. Now processing over 800M events per day in production.",
          sortOrder: 3,
        },
      ],
      media: [
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Transaction graph anomaly view", sortOrder: 0 },
        { type: "screenshot", url: "https://placehold.co/1280x720/0a0a0a/f59e0b?text=media+stub", caption: "Real-time latency monitoring", sortOrder: 1 },
      ],
    },
  ];

  for (const project of projects) {
    const { tagSlugs, sections, media, category: _category, ...projectData } = project;

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

    if (media && media.length > 0) {
      const mediaValues = media.map((m) => ({
        projectId: inserted.id,
        type: m.type,
        url: m.url,
        caption: m.caption,
        sortOrder: m.sortOrder,
      }));
      await db.insert(mediaAssetsTable).values(mediaValues).onConflictDoNothing();
    }

    console.log(`Created project: ${project.title}`);
  }

  const vaultNoteContent: Record<string, string> = {
    "nexus-intelligence": `CLASSIFICATION: CONFIDENTIAL\n\nINTERNAL NOTES — DO NOT DISTRIBUTE\n\nThe RAG pipeline uses a proprietary graph traversal algorithm that we have not disclosed in any public documentation. The knowledge graph layer was the differentiating technical insight that enabled cross-domain synthesis beyond what pure vector search provides.\n\nPerformance concerns: At scale (>10M documents), the multi-hop traversal becomes O(n log n) per query. We mitigated this with a pre-computed subgraph cache, but this is a known architectural debt item.\n\nThe pharmaceutical client who found the drug interaction has since filed a continuation patent that cites our tool in the prosecution history. Legal has flagged this for review.`,
    "meridian-grid": `CLASSIFICATION: UNCLASSIFIED\n\nINTERNAL DEPLOYMENT NOTES\n\nThe 31% peak demand reduction figure is an average across all 23 facilities. Two outlier facilities saw 48% and 51% reductions — both had poor baseline energy management. The median reduction is closer to 27%.\n\nThe ML forecasting model retrains nightly on a rolling 90-day window. We discovered in production that weekday vs. weekend patterns diverge significantly when solar generation is a major component. We added a day-type feature that improved forecast accuracy by 11%.\n\nThe facility achieving net-zero during 6 summer months was aided by unusually high solar irradiance that season. The model did not predict this; it was an exogenous factor we now monitor explicitly.`,
    "obsidian-canvas": `CLASSIFICATION: UNCLASSIFIED\n\nARTISTIC & TECHNICAL NOTES\n\nThe noise field algorithm uses a custom 4D simplex implementation that is 23% faster than the reference implementation due to an optimized gradient table and early exit conditions. This is unpublished.\n\nThe Berlin installation ran for 14 months without a system failure, but there were 3 near-misses: two GPU driver crashes caught by the watchdog process, and one power supply fault that the UPS handled. The "zero failures" claim refers to visitor-facing interruptions, not internal events.\n\nBiometric input (GSR, heart rate) was tested in early prototypes but removed from the final installation after privacy concerns were raised by the museum's ethics review board. The system uses audio and environmental sensors only.`,
    "cipher-gateway": `CLASSIFICATION: RESTRICTED\n\nSECURITY OPERATIONS NOTES — RESTRICTED ACCESS\n\nThe Trail of Bits audit found no critical findings but did surface 3 medium-severity issues. All were remediated before the audit report was finalized. The public version of the audit summary does not mention these.\n\nThe zk-SNARK circuit has a known trusted setup requirement. The ceremony was conducted with 5 participants using a Powers of Tau setup. If the ceremony is compromised, all proofs generated become invalid but no user data is exposed — this is by design.\n\nTwo of the four DeFi integrations have not yet deployed to mainnet. The $2.1B TVL figure reflects protocols where integration is live. We do not publicize which integrations are in staging.`,
    "atlas-query": `CLASSIFICATION: CONFIDENTIAL\n\nPRODUCT NOTES — INTERNAL\n\nThe 94.2% query accuracy benchmark was conducted on an internal dataset of 2,400 questions across 6 enterprise schemas. Accuracy drops to approximately 79% on schemas with inconsistent naming conventions and minimal documentation. We are not publishing the benchmark methodology.\n\nOne customer is using Atlas Query to generate reports that are presented to their board without disclosure that the SQL was AI-generated. We have added audit logging to all queries, but this use case raises product liability questions that legal has not resolved.\n\nThe natural language to SQL model is GPT-4 with schema-injection prompting. We are evaluating fine-tuning on customer-specific schemas, but this introduces significant privacy surface area that we have not yet resolved.`,
    "phantom-protocol": `CLASSIFICATION: RESTRICTED\n\nOPERATIONS NOTES — RESTRICTED ACCESS\n\nThe $47M prevented fraud figure was computed by our fraud model, not independently verified by the financial institutions. The actual prevented fraud may differ; the institutions have their own accounting methodologies that do not align with ours.\n\nThe CRDT consensus algorithm has a known edge case involving network partitions lasting longer than 45 seconds. In this scenario, detection signals can diverge. We have a compensating reconciliation process, but it runs post-hoc and can miss real-time fraud windows. This has not occurred in production.\n\nOne of the three financial institutions has deployed a fork of the detection algorithm for purposes beyond fraud detection. We have no visibility into this use case and the contract does not restrict it. Legal has flagged this for the next renewal negotiation.`,
  };

  const allProjects = await db.select().from(projectsTable);
  for (const project of allProjects) {
    const content = vaultNoteContent[project.slug];
    if (content) {
      await db
        .insert(vaultNotesTable)
        .values({ projectId: project.id, content })
        .onConflictDoNothing();
      console.log(`Vault note upserted for: ${project.slug}`);
    }
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
