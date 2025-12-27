// Quick diagnostic test for chat functionality
console.log('=== Chat Diagnostic Test ===');

// Test 1: Check if ChatPanel component exists
try {
  const chatPanel = document.querySelector('[role="dialog"][aria-labelledby="chat-title"]');
  console.log('✓ ChatPanel component:', chatPanel ? 'Found' : 'Not found');
} catch (e) {
  console.log('✗ Error checking ChatPanel:', e);
}

// Test 2: Check if chat toggle button exists
try {
  const chatButton = document.querySelector('button[aria-label="Toggle chat"]');
  console.log('✓ Chat toggle button:', chatButton ? 'Found' : 'Not found');
  if (chatButton) {
    console.log('  - Button visible:', chatButton.offsetParent !== null);
    console.log('  - Button disabled:', chatButton.disabled);
  }
} catch (e) {
  console.log('✗ Error checking chat button:', e);
}

// Test 3: Check React state
try {
  const reactRoot = document.getElementById('__next');
  console.log('✓ React root:', reactRoot ? 'Found' : 'Not found');
} catch (e) {
  console.log('✗ Error checking React root:', e);
}

// Test 4: Try to click the button programmatically
try {
  const chatButton = document.querySelector('button[aria-label="Toggle chat"]');
  if (chatButton) {
    console.log('Attempting to click chat button...');
    chatButton.click();
    setTimeout(() => {
      const chatPanel = document.querySelector('[role="dialog"]');
      console.log('✓ Chat panel after click:', chatPanel ? 'Visible' : 'Not visible');
    }, 100);
  }
} catch (e) {
  console.log('✗ Error clicking button:', e);
}

console.log('=== End Diagnostic Test ===');
