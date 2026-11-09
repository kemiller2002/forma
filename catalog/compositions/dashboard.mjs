export default {
  title: "Operations dashboard",
  description: "A service-owner dashboard: a record header with status and actions, an attention alert, metric cards in a responsive dashboard grid, and a contained table. Status is always text first; color only repeats it.",
  notes: [
    "The [[alert]] comes first in source order because it is the one thing that needs action; metrics follow.",
    "The [[dashboard-grid]] recomposes from several columns to one by available width without reordering the cards.",
    "The deploy table scrolls inside a labelled [[bounded-overflow]] region at narrow widths, so the page never scrolls sideways.",
    "[[status-lozenge]] states (Confirmed, Needs attention, Unknown) remain distinguishable in grayscale and forced colors."
  ],
  html: `<div class="forma-stack">
  <forma-record-header class="forma-component-tag">
    <header class="forma-record-header">
      <div class="forma-record-header__main">
        <nav aria-label="Breadcrumb"><a href="#dashboard-services">Services</a> <span aria-hidden="true">/</span> <a href="#dashboard-checkout">Checkout</a></nav>
        <div class="forma-record-header__title">
          <div><span class="forma-record-header__type">Service</span><h2>Checkout API</h2></div>
          <span class="forma-status-lozenge" data-state="attention">Degraded</span>
        </div>
        <p>Owned by Payments · Europe West</p>
      </div>
      <div class="forma-record-header__actions">
        <button type="button">Open runbook</button>
        <details>
          <summary>More</summary>
          <div class="forma-record-header__menu"><button type="button">Silence alerts</button><button type="button">View history</button></div>
        </details>
      </div>
    </header>
  </forma-record-header>

  <forma-alert class="forma-component-tag">
    <aside class="forma-alert" role="status" data-tone="attention">
      <div class="forma-alert__icon" aria-hidden="true">!</div>
      <div>
        <h3 class="forma-alert__title">Error rate above objective</h3>
        <p>2.4% of requests failed in the last 15 minutes. The objective is 1%.</p>
      </div>
      <button type="button">Investigate</button>
    </aside>
  </forma-alert>

  <forma-dashboard-grid class="forma-component-tag">
    <section class="forma-dashboard-grid" aria-label="Checkout API health">
      <forma-metric-card class="forma-component-tag">
        <article class="forma-metric-card">
          <div class="forma-metric-card__label">Requests per minute</div>
          <div class="forma-metric-card__value">18,240</div>
          <div class="forma-metric-card__context"><span class="forma-status-lozenge" data-state="ok">Confirmed</span></div>
        </article>
      </forma-metric-card>
      <forma-metric-card class="forma-component-tag">
        <article class="forma-metric-card">
          <div class="forma-metric-card__label">Error rate</div>
          <div class="forma-metric-card__value">2.4%</div>
          <div class="forma-metric-card__context"><span class="forma-status-lozenge" data-state="attention">Needs attention</span></div>
        </article>
      </forma-metric-card>
      <forma-metric-card class="forma-component-tag">
        <article class="forma-metric-card">
          <div class="forma-metric-card__label">Queue depth</div>
          <div class="forma-metric-card__value">—</div>
          <div class="forma-metric-card__context"><span class="forma-status-lozenge" data-state="unknown">Unknown</span></div>
          <a href="#dashboard-queue">Why is this unknown?</a>
        </article>
      </forma-metric-card>
    </section>
  </forma-dashboard-grid>

  <forma-bounded-overflow class="forma-component-tag">
    <div class="forma-bounded-overflow" role="region" aria-label="Recent deployments" tabindex="0">
      <table>
        <caption>Recent deployments</caption>
        <thead><tr><th scope="col">Version</th><th scope="col">Started</th><th scope="col">Author</th><th scope="col">Result</th></tr></thead>
        <tbody>
          <tr><th scope="row">2026.09.30-3</th><td><time datetime="2026-09-30T09:12Z">09:12 UTC</time></td><td>Ada Okafor</td><td>Rolled back</td></tr>
          <tr><th scope="row">2026.09.30-2</th><td><time datetime="2026-09-30T07:40Z">07:40 UTC</time></td><td>Lin Park</td><td>Succeeded</td></tr>
        </tbody>
      </table>
    </div>
  </forma-bounded-overflow>
</div>`
};
