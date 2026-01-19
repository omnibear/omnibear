---
name: Bug report
description: Report an issues with a broken feature of Omnibear
title: "[BUG]: "
labels: ["bug", "need-help-reproducing"]
type: bug
body:
  - type: textarea
    id: problem
    attributes:
      label: Issue
      description: "What problem are you having? Include screenshots if possible."
  - type: dropdown
    id: browser
    attributes:
      label: What browser are you using?
      multiple: true
      options:
        - Firefox
        - Chrome or derrivatives (Edge, Vivaldi
        - Built from source
        - N/A
  - type: dropdown
    id: download
    attributes:
      label: How did you install the software?
      options:
        - Browser Extension/Add-on Store
        - Zip file
        - Built from source
        - N/A
  - type: input
    id: version
    attributes:
      label: Extension Version
      description: "What version of Omnibear do you have installed?"
      placeholder: "v2.0.1"
  - type: dropdown
    id: priority
    attributes:
      label: Impact
      description: Indicate how this affects your experience
      options:
        - label: Unable to install
        - label: Unable to post
        - label: Limits functionality
        - label: Disruptive but has workaround
        - label: Mildly annoying
        - label: Barely noticable
  - type: textarea
    id: repro
    attributes:
      label: Reproduction steps
      description: "How do you trigger this bug? Please walk us through it step by step."
  - type: textarea
    id: logs
    attributes:
      label: Logs
      description: "Please include any relevant [log data](https://omnibear.com/help/logging/)."
---
