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
,
  email: entry(
    "A closed envelope indicates an email message, mailbox entry or email channel.",
    ["Email navigation in a communications application.","Identify an email address or message channel next to a text label."],
    ["A message that has already been opened; use email-open.","Sending a message; use send for the action."],
    "Open email",
    ["email-open","inbox","send"]
  ),
  "email-open": entry(
    "An unfolded envelope indicates an opened or read email message.",
    ["Message reading views that distinguish read from unread.","Open-message navigation alongside visible message status."],
    ["Unread messages; use email.","Generic conversations; use chat."],
    "Open read email",
    ["email","inbox","message"]
  ),
  inbox: entry(
    "A tray with an incoming item indicates the mailbox or inbound queue.",
    ["Inbox navigation for new and received messages.","Queues of incoming requests or assignments labelled Inbox."],
    ["A saved or processed item; use archive.","General file storage; use folder."],
    "Open inbox",
    ["email","archive","folder"]
  ),
  send: entry(
    "A paper plane communicates dispatching or sending a message.",
    ["Send actions in email and chat composers.","Submit content to another recipient when the label says Send."],
    ["File upload to a server; use upload.","Forwarding an existing message; use forward."],
    "Send message",
    ["email","forward","upload"]
  ),
  reply: entry(
    "A hooked arrow to the left means reply to the current sender.",
    ["Reply actions in a message thread.","Respond to one sender in email or support conversations."],
    ["Replying to every participant; use reply-all.","Previous-page navigation; use arrow-left."],
    "Reply to sender",
    ["reply-all","forward","arrow-left"]
  ),
  "reply-all": entry(
    "Two hooked arrows to the left mean reply to all participants.",
    ["Reply all in an email conversation.","Respond to a group thread with an explicit recipient list."],
    ["Responding only to one sender; use reply.","Reversing a workflow step; use arrow-left with text."],
    "Reply to all",
    ["reply","forward","users"]
  ),
  forward: entry(
    "A hooked right arrow means forwarding an existing message to another recipient.",
    ["Forward message actions in email and chat.","Reroute a conversation with a new recipient."],
    ["Sending a newly written message; use send.","Continue to the next page; use arrow-right."],
    "Forward message",
    ["reply","send","arrow-right"]
  ),
  attachment: entry(
    "A paperclip indicates one or more files attached to a record or message.",
    ["Add a file attachment to a message composer.","Show that a record includes related attached files and a filename."],
    ["Downloading an attachment; use download.","Inserting a link to a document; use link."],
    "Attach file",
    ["file","email","link"]
  ),
  message: entry(
    "One speech bubble signals a message, note or comment.",
    ["Open a single conversation message.","Show that a record contains textual comments."],
    ["A multi-participant chat room; use chat.","Email-specific communication; use email."],
    "Open message",
    ["chat","email","file-text"]
  ),
  chat: entry(
    "Overlapping bubbles indicate a chat or threaded conversation.",
    ["Chat workspace navigation.","Discuss a work item in a conversation thread."],
    ["A single standalone note; use message.","Audio/video call initiation; use phone or video-call."],
    "Open chat",
    ["message","phone","video-call"]
  ),
  phone: entry(
    "A handset indicates telephone calls and calling contacts.",
    ["Call action beside a verified phone number.","Telephone channel settings and contact methods."],
    ["Starting a video conference; use video-call.","An email contact action; use email."],
    "Call contact",
    ["video-call","email","user"]
  ),
  "video-call": entry(
    "A video camera with a plus symbol indicates initiating a video meeting.",
    ["Start a video call with a participant.","Join a meeting where the button text names the call."],
    ["Recorded video content; use video.","Still-photo capture; use camera."],
    "Start video call",
    ["video","phone","camera"]
  ),
  archive: entry(
    "A storage box indicates moving items into an archive.",
    ["Archive completed or processed emails.","File away records without deleting them."],
    ["Permanent removal; use trash.","Active inbox navigation; use inbox."],
    "Archive message",
    ["inbox","trash","folder"]
  ),
  bookmark: entry(
    "A ribbon tab marks an item saved for later reference.",
    ["Bookmark pages and important documents.","Toggle a reading-list entry alongside explicit state text."],
    ["Saving edits; use save.","Marking a favorite or high priority; use star."],
    "Bookmark document",
    ["star","save","file"]
  ),
  link: entry(
    "Interlocking chain links indicate a hyperlink or association between items.",
    ["Copy or insert a link in a record.","Associate related objects in a workflow or knowledge base."],
    ["Disconnecting a relationship; use unlink.","Opening an external site; use external-link."],
    "Insert link",
    ["unlink","external-link","copy"]
  ),
  unlink: entry(
    "A broken chain indicates removing a link or relationship.",
    ["Remove an existing record association.","Disconnect two linked objects when the user confirms the target."],
    ["Deleting the object itself; use trash.","Creating a new link; use link."],
    "Unlink record",
    ["link","trash","workflow"]
  ),
  share: entry(
    "Connected points indicate sharing an item with other people or destinations.",
    ["Open the share dialog for a file or report.","Share a record to another application or person."],
    ["Send an email composed in this app; use send.","Copy only its URL; use copy or link."],
    "Share document",
    ["send","copy","users"]
  ),
  star: entry(
    "A five-point star indicates favorite, featured or starred.",
    ["Favorite important records and searches.","Star messages for later review alongside visible state."],
    ["A bookmark in a reading list; use bookmark.","A security verification badge; use shield."],
    "Mark as favorite",
    ["bookmark","shield","success"]
  ),
  eye: entry(
    "An open eye indicates show, view or reveal.",
    ["Preview an item without editing.","Reveal a password field through a properly named native control."],
    ["A permission decision or security policy; use text.","Concealing content; use eye-off."],
    "Show password",
    ["eye-off","lock","file"]
  ),
  "eye-off": entry(
    "A slashed eye indicates hide or conceal.",
    ["Hide a sensitive field through a named toggle.","Disable a preview while preserving the object."],
    ["Revoking permissions; use text and a clear action.","Deleting an item; use trash."],
    "Hide password",
    ["eye","lock","trash"]
  ),
  minus: entry(
    "A horizontal bar indicates reduce, remove from a count or subtract.",
    ["Decrease a numeric stepper value.","Remove an item from a collection when the control is labelled."],
    ["Deleting data permanently; use trash.","Closing a dialog; use close."],
    "Decrease quantity",
    ["add","trash","close"]
  ),
  "more-vertical": entry(
    "Three vertical dots indicate additional secondary actions.",
    ["Overflow menu in a narrow row or mobile toolbar.","Open an item actions popover when vertical space is constrained."],
    ["Primary navigation; use menu.","Loading status; use the progress component."],
    "More record actions",
    ["more-horizontal","menu","settings"]
  ),
  maximize: entry(
    "Four outward corners indicate expand to a larger surface.",
    ["Expand a document preview to full screen.","Maximize an editor canvas or media panel."],
    ["Zooming the image content without enlarging the surface; label Zoom.","Shrink to a smaller view; use minimize."],
    "Maximize editor",
    ["minimize","external-link","eye"]
  ),
  minimize: entry(
    "Four inward corners indicate shrink or leave expanded view.",
    ["Return from a maximized canvas.","Minimize a panel while keeping its contents."],
    ["Closing the surface entirely; use close.","Expand to full screen; use maximize."],
    "Minimize editor",
    ["maximize","close","eye-off"]
  ),
  "file-text": entry(
    "A page with written lines means a text-rich document.",
    ["Documentation, notes and written reports.","Distinguish a text file from photographs and videos in a collection."],
    ["A generic unknown file type; use file.","Copying document content; use copy."],
    "Open text document",
    ["file","image","clipboard"]
  ),
  image: entry(
    "A landscape in a frame represents a still image.",
    ["Photo gallery items and image attachments.","Image media type filters in a file browser."],
    ["Launching the camera; use camera.","Moving pictures; use video."],
    "Open image",
    ["camera","video","file"]
  ),
  camera: entry(
    "A camera outline means taking or capturing a still photo.",
    ["Take photo action in a profile or receipt form.","Camera access and capture settings."],
    ["An existing picture file; use image.","Recording a movie; use video."],
    "Take photo",
    ["image","video","microphone"]
  ),
  video: entry(
    "A play triangle in a frame indicates a video clip or recorded movie.",
    ["Recorded video assets in a file library.","Play or inspect a video item, alongside descriptive text."],
    ["Live video meetings; use video-call.","Still photographs; use image."],
    "Play video",
    ["video-call","image","camera"]
  ),
  microphone: entry(
    "A microphone indicates voice input or audio recording.",
    ["Start a dictated input session.","Voice recording controls with visible recording state."],
    ["Telephone calls; use phone.","Playing a video; use video."],
    "Record voice",
    ["phone","video","message"]
  ),
  clipboard: entry(
    "A held paper checklist indicates the clipboard or paste-related tasks.",
    ["Paste-from-clipboard actions where supported.","Checklist/document clipboards in a work management view."],
    ["Copying to the clipboard; use copy.","Standalone document content; use file-text."],
    "Paste from clipboard",
    ["copy","file-text","workflow"]
  ),
  "chevron-left": entry(
    "A left chevron indicates stepping or disclosure toward the left.",
    ["Previous item controls in a pager.","Collapse a right-hand panel with a separately named button."],
    ["Navigating back through browser history; use arrow-left.","Changing an item order; use sort or explicit buttons."],
    "Previous item",
    ["chevron-right","arrow-left","chevron-up"]
  ),
  "chevron-right": entry(
    "A right chevron indicates stepping or disclosure toward the right.",
    ["Next item controls in a pager.","Expand the next level of a tree or side panel."],
    ["Sending a message; use send.","Navigating across workflow transitions without context; label that action."],
    "Next item",
    ["chevron-left","arrow-right","chevron-down"]
  ),
  "map-pin": entry(
    "A drop-shaped marker indicates a specific location or place.",
    ["Office addresses and mapped destinations.","A geographic coordinate next to a readable place name."],
    ["Home dashboard navigation; use home.","Global settings or language; use globe."],
    "View location",
    ["globe","compass","home"]
  ),
  globe: entry(
    "A globe with latitude and longitude lines represents the world or international context.",
    ["Language and region selection.","Global navigation and international settings."],
    ["A specific point on a map; use map-pin.","A local home page; use home."],
    "Change language",
    ["map-pin","compass","home"]
  ),
  compass: entry(
    "A compass rose represents direction, orientation or exploring a map.",
    ["Explore map regions or navigation tools.","Orientation controls with a readable direction label."],
    ["A specific fixed address; use map-pin.","Website settings; use settings."],
    "Explore map",
    ["map-pin","globe","arrow-right"]
  ),
  info: entry(
    "An i in a circle indicates supplementary information or explanation.",
    ["Show details and explanatory help text.","Informational callouts where the message also appears in words."],
    ["Warnings or recoverable problems; use warning.","A failure state; use error."],
    "More information",
    ["help-circle","warning","error"]
  ),
  error: entry(
    "An X within a circle signals failure or a blocked result.",
    ["Failed validation and error summaries with visible text.","Operational failures that need explicit recovery instructions."],
    ["Closing a panel; use close.","Recoverable warnings; use warning."],
    "Show error details",
    ["warning","close","info"]
  ),
  "help-circle": entry(
    "A question mark in a circle indicates guidance or support.",
    ["Help or contextual assistance entry points.","Open instructions for a complex field."],
    ["A factual note that is not a question; use info.","An error state; use error."],
    "Open help",
    ["info","error","message"]
  ),
  pending: entry(
    "An hourglass indicates a queued, waiting or pending state.",
    ["Pending reviews or asynchronous tasks alongside visible Pending text.","Queue status in administrative worklists."],
    ["Elapsed time or historical timestamp; use clock.","A determinate progress percentage; use a progress component."],
    "Show pending items",
    ["clock","refresh","workflow"]
  ),
  "wifi-off": entry(
    "A crossed wireless signal indicates disconnected or offline connectivity.",
    ["Offline mode status with the visible word Offline.","Connection errors with a clear reconnect action and status."],
    ["Application unavailable for another reason; use error with text.","A locked or restricted service; use lock."],
    "Show connection status",
    ["error","server","refresh"]
  )
});
