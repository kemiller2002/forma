export default {
  title: "Operations dashboard",
  description: "A service-owner dashboard: a record header with status and actions, an attention alert, metric cards in a responsive dashboard grid, and a contained table. Status is always text first; color only repeats it.",
  notes: [
    "The [[alert]] comes first in source order because it is the one thing that needs action; metrics follow.",
    "The [[dashboard-grid]] recomposes from several columns to one by available width without reordering the cards.",
    "The deploy table scrolls inside a labelled [[bounded-overflow]] region at narrow widths, so the page never scrolls sideways.",
    "[[status-lozenge]] states (Confirmed, Needs attention, Unknown) remain distinguishable in grayscale and forced colors."
  ],
  html: `<div class="ef-stack">
  <ef-record-header class="ef-component-tag">
    <header class="ef-record-header">
      <div class="ef-record-header__main">
        <nav aria-label="Breadcrumb"><a href="#dashboard-services">Services</a> <span aria-hidden="true">/</span> <a href="#dashboard-checkout">Checkout</a></nav>
        <div class="ef-record-header__title">
          <div><span class="ef-record-header__type">Service</span><h2>Checkout API</h2></div>
          <span class="ef-status-lozenge" data-state="attention">Degraded</span>
        </div>
        <p>Owned by Payments · Europe West</p>
      </div>
      <div class="ef-record-header__actions">
        <button type="button">Open runbook</button>
        <details>
          <summary>More</summary>
          <div class="ef-record-header__menu"><button type="button">Silence alerts</button><button type="button">View history</button></div>
        </details>
      </div>
    </header>
  </ef-record-header>

  <ef-alert class="ef-component-tag">
    <aside class="ef-alert" role="status" data-tone="attention">
      <div class="ef-alert__icon" aria-hidden="true">!</div>
      <div>
        <h3 class="ef-alert__title">Error rate above objective</h3>
        <p>2.4% of requests failed in the last 15 minutes. The objective is 1%.</p>
      </div>
      <button type="button">Investigate</button>
    </aside>
  </ef-alert>

  <ef-dashboard-grid class="ef-component-tag">
    <section class="ef-dashboard-grid" aria-label="Checkout API health">
      <ef-metric-card class="ef-component-tag">
        <article class="ef-metric-card">
          <div class="ef-metric-card__label">Requests per minute</div>
          <div class="ef-metric-card__value">18,240</div>
          <div class="ef-metric-card__context"><span class="ef-status-lozenge" data-state="ok">Confirmed</span></div>
        </article>
      </ef-metric-card>
      <ef-metric-card class="ef-component-tag">
        <article class="ef-metric-card">
          <div class="ef-metric-card__label">Error rate</div>
          <div class="ef-metric-card__value">2.4%</div>
          <div class="ef-metric-card__context"><span class="ef-status-lozenge" data-state="attention">Needs attention</span></div>
        </article>
      </ef-metric-card>
      <ef-metric-card class="ef-component-tag">
        <article class="ef-metric-card">
          <div class="ef-metric-card__label">Queue depth</div>
          <div class="ef-metric-card__value">—</div>
          <div class="ef-metric-card__context"><span class="ef-status-lozenge" data-state="unknown">Unknown</span></div>
          <a href="#dashboard-queue">Why is this unknown?</a>
        </article>
      </ef-metric-card>
    </section>
  </ef-dashboard-grid>

  <ef-bounded-overflow class="ef-component-tag">
    <div class="ef-bounded-overflow" role="region" aria-label="Recent deployments" tabindex="0">
      <table>
        <caption>Recent deployments</caption>
        <thead><tr><th scope="col">Version</th><th scope="col">Started</th><th scope="col">Author</th><th scope="col">Result</th></tr></thead>
        <tbody>
          <tr><th scope="row">2026.09.30-3</th><td><time datetime="2026-09-30T09:12Z">09:12 UTC</time></td><td>Ada Okafor</td><td>Rolled back</td></tr>
          <tr><th scope="row">2026.09.30-2</th><td><time datetime="2026-09-30T07:40Z">07:40 UTC</time></td><td>Lin Park</td><td>Succeeded</td></tr>
        </tbody>
      </table>
    </div>
  </ef-bounded-overflow>
</div>`
};
