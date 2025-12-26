// Compatibility Test Script for Diamond Admin Page
console.log('Running Diamond Admin Compatibility Test');

// Test 1: Check if TronWeb is available and properly initialized
try {
  console.log('Test 1: Checking TronWeb initialization...');
  if (typeof window.tronWeb !== 'undefined') {
    console.log('✓ TronWeb object is available');
    console.log('  - trx module:', typeof window.tronWeb.trx === 'object');
    console.log('  - contract module:', typeof window.tronWeb.contract === 'function');
    console.log('  - default address:', typeof window.tronWeb.defaultAddress === 'object');
  } else {
    console.log('⚠ TronWeb is not available yet. This is expected if wallet is not connected.');
  }
} catch (error) {
  console.error('✗ Error testing TronWeb:', error.message);
}

// Test 2: Check if diamondAdmin object is properly initialized
try {
  console.log('\nTest 2: Checking diamondAdmin initialization...');
  if (typeof window.diamondAdmin !== 'undefined') {
    console.log('✓ diamondAdmin object is available');
    const methods = ['connectWallet', 'checkOwner', 'loadFacets', 'executeDiamondCut', 'transferOwnership'];
    methods.forEach(method => {
      console.log(`  - ${method}:`, typeof window.diamondAdmin[method] === 'function' ? '✓' : '✗');
    });
  } else {
    console.error('✗ diamondAdmin object is not available');
  }
} catch (error) {
  console.error('✗ Error testing diamondAdmin:', error.message);
}

// Test 3: Validate form elements presence
try {
  console.log('\nTest 3: Checking UI elements...');
  const elementsToCheck = [
    'diamond-address', 'facet-address', 'cut-action',
    'function-selector', 'execute-cut-btn', 'load-facets-btn'
  ];
  
  let allElementsFound = true;
  elementsToCheck.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`  - ✓ Element #${id} found`);
    } else {
      console.log(`  - ✗ Element #${id} NOT found`);
      allElementsFound = false;
    }
  });
  
  if (allElementsFound) {
    console.log('✓ All required UI elements are present');
  } else {
    console.warn('⚠ Some UI elements are missing');
  }
} catch (error) {
  console.error('✗ Error checking UI elements:', error.message);
}

// Test 4: Validate address format utility function
try {
  console.log('\nTest 4: Testing utility functions...');
  if (typeof window.truncateAddress === 'function') {
    const testAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
    const truncated = window.truncateAddress(testAddress);
    console.log(`  - Truncate address test: ${truncated}`);
    console.log(`  - Format correct: ${truncated.startsWith('T9yD1...') && truncated.endsWith('...KHxuWwb')}`);
  } else {
    console.warn('⚠ truncateAddress function not found');
  }
} catch (error) {
  console.error('✗ Error testing utility functions:', error.message);
}

// Test 5: Check for console errors in the last 5 minutes
try {
  console.log('\nTest 5: Checking for recent console errors...');
  console.log('  - Note: This is a manual check. Review your browser console for any recent errors.');
  console.log('  - Common issues to look for: Uncaught ReferenceError, TypeError, etc.');
}

// Integration with main application
if (typeof window.diamondAdmin !== 'undefined') {
  // Add test method to diamondAdmin object
  window.diamondAdmin.runCompatibilityTests = function() {
    console.log('\nRunning compatibility tests on demand...');
    // Re-run tests or additional tests
    try {
      // Test connection status
      console.log('  - Connection status:', window.isConnected ? 'Connected' : 'Not Connected');
      // Test contract instance
      if (window.diamondContract) {
        console.log('  - Contract instance exists');
      } else {
        console.log('  - Contract instance not initialized');
      }
    } catch (e) {
      console.error('  - Error in additional tests:', e.message);
    }
    return true;
  };
  
  console.log('\n✓ Compatibility test module successfully integrated');
} else {
  console.warn('\n⚠ Could not integrate with diamondAdmin object');
}

console.log('\nCompatibility test completed. Review the logs for any issues.');
