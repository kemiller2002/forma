// Documentation for each icon in icons/registry.json. The registry owns
// geometry and identity; this module owns the reader-facing guidance that the
// generated /icons/<name>/ pages show. tests/icon-docs.test.mjs keeps the two
// in step: every registry icon has exactly one entry here and vice versa.
//
// Fields:
//   meaning      what the glyph communicates, in one or two sentences
//   useFor       concrete situations where the icon is the right choice
//   avoid        situations where it misleads, with the better choice
//   actionLabel  an example accessible name for an icon-only control
//   related      other registry icons a reader may be choosing between

const entry = (meaning, useFor, avoid, actionLabel, related) =>
  Object.freeze({ meaning, useFor: Object.freeze(useFor), avoid: Object.freeze(avoid), actionLabel, related: Object.freeze(related) });

export const iconDocs = Object.freeze({
  add: entry(
    "A plus sign: create a new item or add something to the current collection.",
    ["Primary “New record” or “Add row” actions.", "Adding an item to a list, filter set or selection."],
    ["Zoom in or numeric increment; label those explicitly instead.", "Expanding a disclosure; use chevron-down."],
    "Add task",
    ["edit", "upload", "chevron-down"]
  ),
  agent: entry(
    "A friendly robot face: an automated agent or assistant acting in the system.",
    ["Marking work, messages or changes produced by an automated agent.", "Entry points to an assistant panel."],
    ["Human accounts; use user or users.", "Settings for automation; use settings next to the text “Automation”."],
    "Open assistant",
    ["user", "users", "workflow"]
  ),
  "arrow-left": entry(
    "An arrow pointing left: go back to the previous step, page or item.",
    ["“Back” links in multi-step flows.", "Previous item in a pager or carousel."],
    ["Undo; name the action “Undo” in text.", "Collapsing a side panel; use close or a labelled toggle."],
    "Back to results",
    ["arrow-right", "chevron-up"]
  ),
  "arrow-right": entry(
    "An arrow pointing right: continue forward to the next step, page or item.",
    ["“Next” or “Continue” in multi-step flows.", "Next item in a pager.", "Links that lead deeper into a hierarchy."],
    ["Links that leave the site; use external-link.", "Submitting a form; the button text alone is clearer."],
    "Next page",
    ["arrow-left", "external-link"]
  ),
  bell: entry(
    "A bell: notifications and alerts the user can review.",
    ["The notifications entry point in an application header.", "Subscription controls such as “Notify me”."],
    ["Errors or warnings in content; use warning with text.", "Time-based reminders on their own; pair clock with text."],
    "Notifications",
    ["warning", "clock"]
  ),
  bug: entry(
    "An insect: a defect, issue or diagnostic finding.",
    ["Issue or defect records.", "“Report a problem” entry points.", "Diagnostic findings in developer tools."],
    ["General warnings; use warning.", "Security findings; use shield with explicit text."],
    "Report a bug",
    ["warning", "code", "shield"]
  ),
  calendar: entry(
    "A calendar page: dates, scheduling and date pickers.",
    ["Date fields and date-range controls.", "Due dates and scheduled events."],
    ["Durations or elapsed time; use clock.", "History or audit logs; use clock with text."],
    "Choose date",
    ["clock"]
  ),
  chart: entry(
    "A rising line on axes: analytics, reports and measured trends.",
    ["Report and dashboard navigation.", "Switching a data view to a chart."],
    ["Uploading or increasing values; use upload or explicit text.", "Status of a single metric; show the value in text."],
    "Open report",
    ["database", "file"]
  ),
  "chevron-down": entry(
    "A downward chevron: expand, open a menu, or show more below.",
    ["Disclosure and accordion triggers in their collapsed state.", "Menu buttons and select-like controls."],
    ["Downloading; use download.", "Sort order; use sort."],
    "Show details",
    ["chevron-up", "menu", "sort"]
  ),
  "chevron-up": entry(
    "An upward chevron: collapse, close a section, or show less.",
    ["Disclosure and accordion triggers in their expanded state.", "“Back to top” links paired with text."],
    ["Uploading; use upload.", "Sort order; use sort."],
    "Hide details",
    ["chevron-down", "arrow-left"]
  ),
  clock: entry(
    "A clock face: time, duration, history and pending state.",
    ["Timestamps, durations and SLA timers.", "Recently viewed or history lists.", "A pending state shown together with the word “Pending”."],
    ["Calendar dates; use calendar.", "Progress; use a progress component with a value."],
    "View history",
    ["calendar", "refresh"]
  ),
  close: entry(
    "A cross: close, dismiss or remove from view without destroying data.",
    ["Closing dialogs, panels and toasts.", "Removing a chip or filter token."],
    ["Deleting data; use trash so the outcome is clear.", "Failure or error state; use warning with text."],
    "Close dialog",
    ["trash", "arrow-left"]
  ),
  code: entry(
    "Angle brackets around a slash: source code, markup and developer tooling.",
    ["Viewing source or embed code.", "Developer and API documentation links."],
    ["Configuration screens; use settings.", "Terminal or command output in general prose; use text."],
    "View source",
    ["bug", "file"]
  ),
  copy: entry(
    "Two overlapping pages: copy to the clipboard or duplicate.",
    ["Copying a value, link or code sample.", "Duplicating a record."],
    ["Saving or exporting; use save or download.", "Showing multiple files; use folder."],
    "Copy link",
    ["file", "save", "download"]
  ),
  database: entry(
    "A stacked cylinder: a data store, dataset or storage system.",
    ["Data sources and storage settings.", "Infrastructure inventories next to server."],
    ["Saving a record; use save.", "A single file; use file."],
    "Open data source",
    ["server", "chart", "save"]
  ),
  download: entry(
    "An arrow into a tray: transfer a file or export data to this device.",
    ["File downloads and data exports.", "Saving an offline copy."],
    ["Expanding content; use chevron-down.", "Saving changes on the server; use save."],
    "Download report",
    ["upload", "save", "print"]
  ),
  edit: entry(
    "A pencil: change the selected item.",
    ["Edit actions on rows, cards and detail pages.", "Switching a read-only view into editing."],
    ["Creating new items; use add.", "Settings or preferences; use settings."],
    "Edit profile",
    ["add", "settings", "save"]
  ),
  "external-link": entry(
    "A box with an outward arrow: a link that leaves this site or opens elsewhere.",
    ["Links to other domains or documentation sites.", "Links that open a separate application."],
    ["Moving within the same site; use arrow-right or no icon.", "Sharing; describe the action in text."],
    "Open documentation in a new tab",
    ["arrow-right", "copy"]
  ),
  file: entry(
    "A page with a folded corner: a single document or file.",
    ["Document lists and attachments.", "File type or document detail views."],
    ["Collections of files; use folder.", "Copying; use copy."],
    "Open document",
    ["folder", "copy", "print"]
  ),
  filter: entry(
    "A funnel: narrow a collection by criteria.",
    ["Filter panels and filter toggles.", "Showing that filters are applied, together with the count in text."],
    ["Sorting; use sort.", "Searching free text; use search."],
    "Filter results",
    ["sort", "search"]
  ),
  folder: entry(
    "A folder: a container of files or grouped items.",
    ["Directories, projects and collections.", "Moving items into a group."],
    ["A single document; use file.", "Archived state; say “Archived” in text."],
    "Open folder",
    ["file", "database"]
  ),
  home: entry(
    "A house: the application’s home or overview page.",
    ["The first item in primary navigation.", "Returning to a dashboard."],
    ["Address or location data; use text.", "Breadcrumb roots where the text “Home” already appears; keep the icon decorative."],
    "Home",
    ["menu", "arrow-left"]
  ),
  lock: entry(
    "A padlock: locked, restricted or private.",
    ["Read-only or permission-restricted items, with text such as “Locked”.", "Private visibility settings."],
    ["Overall security posture; use shield.", "Signing in; use text such as “Sign in”."],
    "Locked: view access rules",
    ["shield", "user"]
  ),
  menu: entry(
    "Three horizontal lines: open the main navigation menu.",
    ["The navigation toggle on narrow screens.", "Opening a side navigation drawer."],
    ["Item-specific actions; use more-horizontal.", "Lists or text alignment; use no icon."],
    "Open navigation menu",
    ["more-horizontal", "close"]
  ),
  "more-horizontal": entry(
    "Three dots: more actions or options for this item.",
    ["Overflow menus on rows, cards and toolbars.", "Secondary actions that do not fit."],
    ["Primary navigation; use menu.", "Loading state; use a progress or spinner component."],
    "More actions for Invoice 1042",
    ["menu", "settings"]
  ),
  print: entry(
    "A printer: print this page or document.",
    ["Print actions on documents, invoices and reports.", "Print-preview entry points."],
    ["Exporting a PDF file; use download with the text “PDF”.", "Saving; use save."],
    "Print invoice",
    ["download", "file"]
  ),
  refresh: entry(
    "Two curved arrows in a cycle: reload, retry or synchronise.",
    ["Reloading stale data.", "Retrying a failed operation, with the word “Retry”.", "Manual sync controls."],
    ["Undo or history; use clock or text.", "Ongoing loading; use a progress component."],
    "Refresh data",
    ["clock", "download"]
  ),
  save: entry(
    "A storage disk: save changes.",
    ["Save actions in editors and forms.", "Showing that a draft has been saved, with text."],
    ["Downloading a copy; use download.", "Data stores; use database."],
    "Save changes",
    ["download", "edit", "database"]
  ),
  search: entry(
    "A magnifying glass: search or find.",
    ["Search fields and search buttons.", "Opening a command or search palette."],
    ["Zoom; label zoom controls explicitly.", "Filtering by structured criteria; use filter."],
    "Search",
    ["filter", "sort"]
  ),
  server: entry(
    "Stacked server units: a host, service or infrastructure node.",
    ["Hosts, environments and deployment targets.", "Infrastructure health views, with status text."],
    ["Data stores; use database.", "Network connectivity on its own; use text."],
    "Open server details",
    ["database", "shield"]
  ),
  settings: entry(
    "A gear: settings, preferences and configuration.",
    ["Application and account settings entry points.", "Configuration panels for an item."],
    ["Editing content; use edit.", "Workflow or process diagrams; use workflow."],
    "Settings",
    ["edit", "more-horizontal", "workflow"]
  ),
  shield: entry(
    "A shield with a check: security, protection and verified trust.",
    ["Security settings and posture summaries.", "Verified or protected items, with text naming the verification."],
    ["Individual locked items; use lock.", "Generic success; use success."],
    "Security settings",
    ["lock", "success", "warning"]
  ),
  sort: entry(
    "Opposing up and down arrows: change the sort order.",
    ["Sortable column headers and sort controls.", "Reordering a list."],
    ["Filtering; use filter.", "Expand or collapse; use chevrons."],
    "Sort by date",
    ["filter", "chevron-down"]
  ),
  success: entry(
    "A check in a circle: complete, passed or successful.",
    ["Completed steps, passed checks and confirmed states, always with text such as “Complete”.", "Success messages."],
    ["Selection checkboxes; use a native checkbox.", "Security verification; use shield."],
    "Mark complete",
    ["warning", "shield"]
  ),
  trash: entry(
    "A rubbish bin: delete permanently or move to trash.",
    ["Delete actions on rows, files and records.", "Emptying or opening the trash."],
    ["Dismissing or closing; use close.", "Clearing a filter; use close."],
    "Delete file",
    ["close", "edit"]
  ),
  upload: entry(
    "An arrow out of a tray: send a file or import data from this device.",
    ["File upload and import actions.", "Publishing a local file to the system."],
    ["Collapsing content; use chevron-up.", "Sharing a link; describe it in text."],
    "Upload file",
    ["download", "add"]
  ),
  user: entry(
    "A single person: a user, account or profile.",
    ["Account menus and profile links.", "Assignee or owner fields."],
    ["Groups or teams; use users.", "Automated actors; use agent."],
    "Account",
    ["users", "agent", "lock"]
  ),
  users: entry(
    "Two people: a team, group or set of members.",
    ["Team and membership pages.", "Sharing with or assigning to a group."],
    ["A single account; use user.", "Automated actors; use agent."],
    "Manage team",
    ["user", "agent"]
  ),
  warning: entry(
    "An exclamation mark in a triangle: caution, attention needed or a recoverable problem.",
    ["Warnings and validation problems, always with text naming the issue.", "Items that need review."],
    ["Successful states; use success.", "Notifications in general; use bell."],
    "Show warnings",
    ["success", "bell", "bug"]
  ),
  workflow: entry(
    "Connected nodes: a workflow, process diagram or sequence of steps.",
    ["Workflow and process designer entry points.", "Linking to a process definition."],
    ["Settings; use settings.", "Data relationships in general; use text."],
    "Open workflow",
    ["agent", "settings"]
  )
});
