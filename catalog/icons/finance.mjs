// Six domain-neutral finance and organization glyphs added by Forma 1.1.0
// (forma#204). Original artwork on the 24-unit grid; independent visual
// review is still open (docs/ICONS.md).
import {entry} from "./entry.mjs";

export const financeIconDocs = Object.freeze({
  gift: entry(
    "A wrapped box with a bow indicates something given: a gift, grant or donation.",
    ["Navigation to gifts, grants or donations made or received.","Label a recommended or completed gift next to a text label."],
    ["Adding money to an account; use hand-coins.","Generic creation; use add."],
    "Recommend a gift",
    ["hand-coins","receipt","send"]
  ),
  bank: entry(
    "A columned building with a pediment indicates a bank or other financial institution.",
    ["A linked bank account, bank transfer details or a funding source.","Settings for payout or deposit accounts."],
    ["Any organization that is not a financial institution; use building.","Money movement itself; use hand-coins or send."],
    "View bank account",
    ["building","hand-coins","receipt"]
  ),
  building: entry(
    "An office building indicates an organization: a company, charity, school or other institution.",
    ["Organization profiles, recipients and payees.","Lists that mix people (user) with organizations."],
    ["Places on a map; use map-pin.","Financial institutions specifically; use bank.","Home or start pages; use home."],
    "Open organization profile",
    ["bank","users","globe"]
  ),
  receipt: entry(
    "A paper slip with a torn edge indicates proof of a completed payment or transaction.",
    ["Receipts and acknowledgements for payments or contributions.","Transaction details after a purchase or transfer."],
    ["Formal documents with a seal, such as statements of record; use certificate.","Bills that are still due; use file-text with a label."],
    "Download receipt",
    ["certificate","file-text","print"]
  ),
  certificate: entry(
    "A document with a seal and ribbon indicates a formal credential, award or attestation.",
    ["Certificates, attestations and acknowledgement letters.","Proof of status or completion that a user may download."],
    ["Everyday receipts; use receipt.","Security or verification state; use shield."],
    "Download certificate",
    ["receipt","file-text","shield"]
  ),
  "hand-coins": entry(
    "An open hand below a coin indicates giving or depositing money.",
    ["Contributions, deposits and adding funds to an account.","Payment actions whose label names the amount or recipient."],
    ["Gifts or grants as objects; use gift.","Sending a message; use send."],
    "Add funds",
    ["gift","bank","receipt"]
  )
});
