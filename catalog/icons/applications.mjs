// Additional forty application glyphs added by Forma 0.6.0.
import {entry} from "./entry.mjs";

export const applicationIconDocs = Object.freeze({
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
