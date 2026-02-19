# Review POK CRUD Spec

My review on the `.spec-draft-temp.md` for the POK CRUD Feature:

## Context

I'm reading the draft and I liked it very much. The one thing I'd like to change is: I don't want both titles and contents to be
mandatory.

Picture this situation:

"""
Say I'm studying DSAs and stumble upon a graph problem. Then I open ED and register "whenever facing X type of problem, prefer BFS (breadth-first-search) instead of DFS".
"""

That in and on itself is a learning. Does it really require a title? I guess **forcing** the user to title the POK, while may help him/her think harder and memorize the learning, might also bring more unnecessary friction, bureaucracy to the process.

## About Requirements

### Changes in Current Requirements

Given the context above, I immediately see changes to requirements - but not limited to them:

* FR2 - as the title will be optional
* FR3 - as the content might be optional (if and only if the title is empty, otherwise there would be nothing to be recorded). I'm still not 100% sure on this, help me weight the trade-offs. Maybe only the title should be optional and the content always mandatory.
* FR8 - the title field should be pre-loaded with a sort of gray/faded message saying "optional" or something to let the user know they may skip it
* FR17 - list/grid view: that should be several user-selected visualizations of POKs, not only list/grid by default. I was imagining some sort of cards. Like a deck of flash cards, post-it notes, linked through lines and arrows, where user can swipe through than to go further in the past. Like a carrousel of POKs (such as an Instagram feed post with several pictures in it). Help me on this.
* FR28 - I want soft delete from day one. MVP should have it. No hard deletes whatsoever.
* NFR13 - Must have

### New Requirements

* FR## - there should be an "undo" feature under "POK Update" in case the user wants to "ctrl+z" the editing of a POK. Like they open it but they input a typo or something. Also, when updating a POK, there should be visual feedback. Like the original text is in "gray" and the new is highlighted in blue, something like that, so the user can compare the original "thought" to the newly added input while they are inputting it. Once saved, whenever retrieved later on, that updated POK should be shown without any highlights separating the original from the updated content. That should only happen DURING update, when the user is literally typing.
* Other: at some given point, there will be a type of categorization. In that case, the data schema should allow for several different tags in the same POK. So we must prepare for that. (I saw that is covered in the **out of scope** section)

* A requirement is that ED MUST work in all 3 scenarios:
  1. user only types in the title
  2. user only types in the content
  3. user types in both.

### Questions about requirements

* FR9 - I don't fully understand what it means
* NFR8 - I don't know what are ARIA attributes

### Overall requirements

* Both the categorization and the semantic features should work without issues on any of these scenarios. A possible additional optional feature is to have AI auto-generate title suggestions for POKs without titles that the user inputs, but even still, the user should have the option to record that POK without formally naming it.

## Goal

The goal here is to have the most easy, fast, frictionless experience. Have product-manager (or any other agent or model you suggest) help me achieve that goal.
