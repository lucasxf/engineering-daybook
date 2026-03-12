# Tagging System Review

## Changes in Current Requirements

- FR2 - As the user might - and likely will - forget previously created tags, the app shouldn't return an error to them, but graciously accept the "new" tag (and ignore it instead of recording it again on the backend side of it, while still using the formerly added tag to that newly recorded POK)
- FR3 - To their own perspective, renamed tags (in case of typos, for instance) should be allowed, but as we add AI capabilities and some tags will be auto-generated, for instance, user types "sprimg-boot" while the subject is "spring-boot", the "wrong" tag should be soft-deleted for UX purposes, but not physically removed from our data bases. The goal here is to have simultaneously user-specific tags, and cross-platform tags (imagine we have millions of users using a generic tag #engineering or #tech and the first user to ever use it changes it? Now we propagate it and break everything other users were using? So it's like we have shared tags across the entire app. My goal is to have that. From the user perspective, their tags are their own, from the app perspective, there's a common pool of reusable tags)
- FR4 - Same (or at least equivalent) conditions described above for FR3 apply here
- FR5 - Adjust this so it doesn't violate what I described for FR3. Also, that should only be valid for user-created tags, not AI suggested ones. Also, think about soft-deletes.
- FR6: MUST HAVE
- FR7: MUST HAVE
- FR9: Agreed. But "collapse" over a threshold of tags, like 3 tags tops, and then after that we add something like "..." for the user to expand and see all tags related to that POK
- FR13: Not only names in the text, but also in the title
- FR17: I want to know when AI "messes up". Maybe a new enumeration like `source=HYBRID` or `source=AI_USER_EDITED` or `source=AI_USER_FIX`, something like that

## New Requirements to add

- colorful tags: each new tag should have a randomly selected color from a pool of 6-8 different colors, like post-its on a screen, text marker pens, highlighted texts or colorful sticker on a binder (again, focusing on the learning mission here)