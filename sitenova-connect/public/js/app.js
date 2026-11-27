const modules = {
  dashboard: { title: "Overview", description: "Your operational dashboard, KPIs, activity feed and WhatsApp health indicators will appear here when the dashboard API is migrated." },
  inbox: { title: "Shared Inbox", description: "Conversation list, assignment, realtime messages, media, reactions, templates and reply composer are part of the inbox migration." },
  contacts: { title: "Contacts", description: "Contact records, tags, custom fields, CSV import and deduplication are being mapped from the original application." },
  pipelines: { title: "Pipelines", description: "Sales stages, deal cards, drag-and-drop and pipeline totals will be migrated with their original permissions." },
  broadcasts: { title: "Campaigns", description: "WhatsApp templates, audience selection, personalization, scheduling and delivery tracking will be migrated." },
  automations: { title: "Automations", description: "Triggers, conditions, wait steps, actions, execution history and durable background processing are planned." },
  flows: { title: "Flows", description: "The flow canvas, node configuration, validation, activation and run history are included in the parity scope." },
  agents: { title: "AI Agents", description: "AI configuration, draft replies, auto-reply, playground, usage and knowledge retrieval require secure server-side providers." },
  settings: { title: "Settings", description: "Workspace, WhatsApp, team, roles, API keys, webhooks, preferences and account settings will be migrated." }
};

const app = document.querySelector("#app");
const title = document.querySelector("#page-title");
const navLinks = [...document.querySelectorAll("[data-route]")];

function render() {
  const route = location.hash.replace(/^#\/?/, "").split("/")[0] || "dashboard";
  const page = modules[route] || modules.dashboard;
  title.textContent = page.title;
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.route === route));
  if (route === "dashboard") {
    app.innerHTML = `
      <div class="welcome-card"><p class="eyebrow">SITENOVA CONNECT</p><h2>One workspace for every customer conversation.</h2><p>${page.description}</p></div>
      <div class="stat-grid">
        <article class="stat-card"><span>Conversations</span><strong>—</strong><small>Awaiting API migration</small></article>
        <article class="stat-card"><span>Contacts</span><strong>—</strong><small>Awaiting API migration</small></article>
        <article class="stat-card"><span>Campaigns</span><strong>—</strong><small>Awaiting API migration</small></article>
        <article class="stat-card"><span>Automation runs</span><strong>—</strong><small>Awaiting API migration</small></article>
      </div>`;
  } else {
    app.innerHTML = `<section class="module-placeholder"><p class="eyebrow">FEATURE MIGRATION</p><h2>${page.title}</h2><p>${page.description}</p><p>Original functionality remains in the source application while this module is being ported and tested.</p></section>`;
  }
}

window.addEventListener("hashchange", render);
render();
