/**
  * Empirical Test Harness for SearchBar Rapid Clear Clicks
  */
 const React = require('react');

 // Harness to simulate SearchBar component state & effect hooks under rapid actions
 function simulateSearchBar() {
   let value = 'initial query';
   let isClearingRef = { current: false };
   let timerRef = { current: null };
   let debouncedCalls = [];

   const onDebouncedChange = (val) => {
     debouncedCalls.push({ time: Date.now(), val });
   };

   const debounceMs = 300;

   // Helper simulating useEffect dependency triggers [value]
   let prevValue = value;
   function triggerEffectIfNeeded() {
     if (value !== prevValue) {
       prevValue = value;
       // Execute useEffect logic:
       if (isClearingRef.current) {
         isClearingRef.current = false;
         return;
       }

       if (timerRef.current !== null) {
         clearTimeout(timerRef.current);
       }
       timerRef.current = setTimeout(() => {
         onDebouncedChange(value);
       }, debounceMs);
     }
   }

   function onChangeText(newVal) {
     value = newVal;
     triggerEffectIfNeeded();
   }

   function handleClear() {
     if (timerRef.current !== null) {
       clearTimeout(timerRef.current);
       timerRef.current = null;
     }
     isClearingRef.current = true;
     onChangeText('');
     onDebouncedChange('');
   }

   return {
     getValue: () => value,
     getIsClearing: () => isClearingRef.current,
     getDebouncedCalls: () => debouncedCalls,
     handleClear,
     onChangeText,
     clearHistory: () => { debouncedCalls = []; }
   };
 }

 console.log('====================================================');
 console.log('TESTING SEARCHBAR RAPID CLEAR CLICKS & SIDE EFFECTS');
 console.log('====================================================\n');

 // Test Case A: Single Clear
 console.log('--- Test Case A: Single Clear Button Click ---');
 const sb1 = simulateSearchBar();
 console.log('Initial value:', sb1.getValue());
 sb1.handleClear();
 console.log('Value after clear 1:', sb1.getValue());
 console.log('isClearingRef after clear 1 + effect:', sb1.getIsClearing());
 console.log('Debounced calls after clear 1:', sb1.getDebouncedCalls());

 // Test Case B: Rapid Double Clear Click
 console.log('\n--- Test Case B: Rapid Double Clear Button Click ---');
 const sb2 = simulateSearchBar();
 sb2.handleClear(); // Click 1
 sb2.handleClear(); // Click 2 (rapid second click while already cleared)
 console.log('Value after double clear:', sb2.getValue());
 console.log('isClearingRef after double clear:', sb2.getIsClearing());
 console.log('Debounced calls after double clear:', sb2.getDebouncedCalls());

 console.log('\n--- Typing new query "apple" after double clear ---');
 sb2.clearHistory();
 sb2.onChangeText('apple');

 setTimeout(() => {
   console.log('Debounced calls after typing "apple":', sb2.getDebouncedCalls());
   if (sb2.getDebouncedCalls().length === 0) {
     console.log('\n❌ EMPIRICAL BUG REPRODUCED: Typing "apple" after rapid clear failed to trigger onDebouncedChange because isClearingRef was stuck at true!');
   } else {
     console.log('\n✅ PASS: Debounced change triggered successfully.');
   }
 }, 400);
