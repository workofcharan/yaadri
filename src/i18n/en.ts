export const en = {
  appName: 'YAADRI',
  tagline: 'Your Personal AI Memory Companion (fictional demo)',
  nav: { home: 'Home', capsules: 'Memory Capsules', teach: 'Teach YAADRI', graph: 'Memory Graph', games: 'Games', reminders: 'Reminders', dashboard: 'Dashboard', copilot: 'Copilot' },
  role: { caregiver: 'Caregiver', patient: 'Patient', switch: 'Switch role (demo only, not authentication)' },
  common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', verify: 'Verify', archive: 'Archive', loading: 'Loading…', empty: 'Nothing here yet.', error: 'Something went wrong.', retry: 'Retry', confirm: 'Confirm', reject: 'Reject', correct: 'Correct', back: 'Back', restart: 'Restart', exit: 'Exit', start: 'Start', continueLabel: 'Continue' },
  capsules: {
    title: 'Memory Capsules', newCapsule: 'New capsule', storyLabel: 'Story', photoLabel: 'Photo', audioLabel: 'Voice recording (optional)',
    unverifiedNotice: 'Draft — not yet shown to the patient or used in games.', verifiedNotice: 'Verified',
    uploadAudioFallback: 'Upload an audio file (microphone recording used when available)',
    micPermissionDenied: 'Microphone access was denied. You can still upload an audio file instead.',
  },
  teach: {
    title: 'Teach YAADRI About Me', pasteStory: 'Paste a family story', extract: 'Extract', reviewTitle: 'Review suggestions',
    ambiguous: 'Not confidently understood — please enter manually.', nothingAutoVerified: 'Nothing becomes verified automatically.',
  },
  graph: { title: 'Living Memory Graph', listView: 'List view', graphView: 'Graph view', selectPrompt: 'Select a person, place, or event to see related verified memories.' },
  games: {
    faceName: { title: 'Face-Name Recall', prompt: 'Who is this?' },
    connect: { title: 'Connect the Memory', prompt: 'Tap two related cards to match them.' },
    puzzle: { title: 'Memory Puzzle', prompt: 'Tap a piece, then tap where it should go.' },
    needMoreContent: 'Not enough verified memories yet to play this game. Add and verify more capsules first.',
  },
  rescue: {
    level1: 'Context clue', level2: 'Relationship hint', level3: 'Related memory', level4: 'Familiar voice', level5: 'Gentle reveal',
    unavailable: 'Not available for this memory yet.', tryAgain: "That's alright — let's try a hint.", needHelp: 'I need help',
  },
  reminders: { title: 'Reminders', addReminder: 'Add reminder', today: "Today's reminders", noneToday: 'No reminders today.', snooze: 'Snooze', markDone: 'Mark done', offlineNote: 'Reminders work offline from saved data. Background alarms are not guaranteed while the browser is closed.' },
  dashboard: { title: 'Caregiver Dashboard', recentSessions: 'Recent sessions', completionRate: 'Completion', cueUse: 'Cue use', neededMoreHelp: 'Needed more assistance', filterDays: 'Time range', noData: 'No activity recorded yet for this range.' },
  copilot: { title: 'Copilot', placeholder: 'Ask e.g. "How was Shanti this week?"', ruleBasedTag: 'Rule-based summary', aiTag: 'Optional AI-worded summary', unsupported: "I can answer questions about weekly activity, cue use, and completed activities. I couldn't match that question — try one of the suggested prompts." },
  privacy: { exportData: 'Export my data', deleteData: 'Delete local data', resetDemo: 'Reset local demo data', consentNote: 'This is a fictional local demo. Data is stored only in this browser.' },
}
export type Dict = typeof en
