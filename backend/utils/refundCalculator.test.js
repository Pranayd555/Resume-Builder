const RefundCalculator = require('./refundCalculator');

/**
 * Test Suite for RefundCalculator
 * Covers all 6 refund scenarios
 */

class RefundCalculatorTest {
  static runAllTests() {
    console.log('🧪 Running RefundCalculator Test Suite\n');

    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Scenario 1: Full refund, no bonus
    console.log('📋 SCENARIO 1: Token Bought, No Bonus, Balance >= Tokens Bought');
    try {
      const transaction1 = {
        transactionId: 'txn_001',
        amount: 100000,
        metadata: { boughtTokens: 100, bonusTokensAdded: 0 }
      };
      const userState1 = { tokens: 100, bonusTokens: 0 };
      const result1 = RefundCalculator.calculateRefund(transaction1, userState1, 100000);

      const pass1 = result1.scenario === 1 && result1.refundAmount === 100000 && result1.refundPercentage === 100;
      console.log(`✓ Scenario 1: ${pass1 ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(result1.refundAmount)} (Expected: ₹1000.00)`);
      console.log(`  - Refund %: ${result1.refundPercentage}% (Expected: 100%)`);
      console.log(`  - Status: ${result1.status}`);
      console.log(`  - Message: ${result1.message}\n`);
      
      results.passed += pass1 ? 1 : 0;
      results.failed += pass1 ? 0 : 1;
      results.tests.push({ scenario: 1, passed: pass1 });
    } catch (error) {
      console.log(`✗ Scenario 1: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ scenario: 1, passed: false, error: error.message });
    }

    // Scenario 2: Partial refund, no bonus
    console.log('📋 SCENARIO 2: Token Bought, No Bonus, Balance < Tokens Bought');
    try {
      const transaction2 = {
        transactionId: 'txn_002',
        amount: 100000,
        metadata: { boughtTokens: 100, bonusTokensAdded: 0 }
      };
      const userState2 = { tokens: 30, bonusTokens: 0 };
      const result2 = RefundCalculator.calculateRefund(transaction2, userState2, 100000);

      const pass2 = result2.scenario === 2 && result2.refundAmount === 30000 && result2.refundPercentage === 30;
      console.log(`✓ Scenario 2: ${pass2 ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(result2.refundAmount)} (Expected: ₹300.00)`);
      console.log(`  - Refund %: ${result2.refundPercentage}% (Expected: 30%)`);
      console.log(`  - Status: ${result2.status}`);
      console.log(`  - Message: ${result2.message}\n`);
      
      results.passed += pass2 ? 1 : 0;
      results.failed += pass2 ? 0 : 1;
      results.tests.push({ scenario: 2, passed: pass2 });
    } catch (error) {
      console.log(`✗ Scenario 2: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ scenario: 2, passed: false, error: error.message });
    }

    // Scenario 3: Full refund with bonus
    console.log('📋 SCENARIO 3: Token Bought with Bonus, Balance >= Bought + Bonus');
    try {
      const transaction3 = {
        transactionId: 'txn_003',
        amount: 100000,
        metadata: { boughtTokens: 100, bonusTokensAdded: 50 }
      };
      const userState3 = { tokens: 100, bonusTokens: 50 };
      const result3 = RefundCalculator.calculateRefund(transaction3, userState3, 100000);

      const pass3 = result3.scenario === 3 && result3.refundAmount === 100000 && result3.refundPercentage === 100;
      console.log(`✓ Scenario 3: ${pass3 ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(result3.refundAmount)} (Expected: ₹1000.00)`);
      console.log(`  - Refund %: ${result3.refundPercentage}% (Expected: 100%)`);
      console.log(`  - Status: ${result3.status}`);
      console.log(`  - Message: ${result3.message}\n`);
      
      results.passed += pass3 ? 1 : 0;
      results.failed += pass3 ? 0 : 1;
      results.tests.push({ scenario: 3, passed: pass3 });
    } catch (error) {
      console.log(`✗ Scenario 3: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ scenario: 3, passed: false, error: error.message });
    }

    // Scenario 4: Partial refund with bonus (bonus used)
    console.log('📋 SCENARIO 4: Token Bought with Bonus, Balance >= Bought but Bonus < Added');
    try {
      const transaction4 = {
        transactionId: 'txn_004',
        amount: 100000,
        metadata: { boughtTokens: 100, bonusTokensAdded: 50 }
      };
      const userState4 = { tokens: 100, bonusTokens: 20 };
      const result4 = RefundCalculator.calculateRefund(transaction4, userState4, 100000);

      // Bonus used = 50 - 20 = 30
      // Refund tokens = 100 - 30 = 70
      // Refund amount = 70000 (₹700)
      const pass4 = result4.scenario === 4 && result4.refundAmount === 70000 && result4.refundPercentage === 70;
      console.log(`✓ Scenario 4: ${pass4 ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(result4.refundAmount)} (Expected: ₹700.00)`);
      console.log(`  - Refund %: ${result4.refundPercentage}% (Expected: 70%)`);
      console.log(`  - Status: ${result4.status}`);
      console.log(`  - Message: ${result4.message}\n`);
      
      results.passed += pass4 ? 1 : 0;
      results.failed += pass4 ? 0 : 1;
      results.tests.push({ scenario: 4, passed: pass4 });
    } catch (error) {
      console.log(`✗ Scenario 4: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ scenario: 4, passed: false, error: error.message });
    }

    // Scenario 5A: No refund (below threshold)
    console.log('📋 SCENARIO 5A: Token Bought with Bonus, Balance < Bought, Not Eligible');
    try {
      const transaction5a = {
        transactionId: 'txn_005a',
        amount: 100000,
        metadata: { boughtTokens: 100, bonusTokensAdded: 50 }
      };
      const userState5a = { tokens: 40, bonusTokens: 10 };
      const result5a = RefundCalculator.calculateRefund(transaction5a, userState5a, 100000);

      // Bonus used = 50 - 10 = 40
      // Effective tokens = 40 - 40 = 0 (below 1 token threshold)
      const pass5a = result5a.status === 'not_eligible' && result5a.refundAmount === 0;
      console.log(`✓ Scenario 5A: ${pass5a ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(result5a.refundAmount)} (Expected: ₹0.00)`);
      console.log(`  - Status: ${result5a.status} (Expected: not_eligible)`);
      console.log(`  - Message: ${result5a.message}\n`);
      
      results.passed += pass5a ? 1 : 0;
      results.failed += pass5a ? 0 : 1;
      results.tests.push({ scenario: '5A', passed: pass5a });
    } catch (error) {
      console.log(`✗ Scenario 5A: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ scenario: '5A', passed: false, error: error.message });
    }

    // Scenario 5B: Partial refund (eligible)
    console.log('📋 SCENARIO 5B: Token Bought with Bonus, Balance < Bought, Eligible');
    try {
      const transaction5b = {
        transactionId: 'txn_005b',
        amount: 100000,
        metadata: { boughtTokens: 100, bonusTokensAdded: 50 }
      };
      const userState5b = { tokens: 60, bonusTokens: 5 };
      const result5b = RefundCalculator.calculateRefund(transaction5b, userState5b, 100000);

      // Bonus used = 50 - 5 = 45
      // Effective tokens = 60 - 45 = 15
      // Refund amount = 15000 (₹150)
      const pass5b = result5b.status === 'eligible' && result5b.refundAmount === 15000 && result5b.refundPercentage === 15;
      console.log(`✓ Scenario 5B: ${pass5b ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(result5b.refundAmount)} (Expected: ₹150.00)`);
      console.log(`  - Refund %: ${result5b.refundPercentage}% (Expected: 15%)`);
      console.log(`  - Status: ${result5b.status} (Expected: eligible)`);
      console.log(`  - Message: ${result5b.message}\n`);
      
      results.passed += pass5b ? 1 : 0;
      results.failed += pass5b ? 0 : 1;
      results.tests.push({ scenario: '5B', passed: pass5b });
    } catch (error) {
      console.log(`✗ Scenario 5B: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ scenario: '5B', passed: false, error: error.message });
    }

    // Test: Refund never exceeds paid amount
    console.log('📋 TEST: Refund Amount Cap');
    try {
      const transactionCap = {
        transactionId: 'txn_cap',
        amount: 10000, // ₹100
        metadata: { boughtTokens: 1000, bonusTokensAdded: 0 }
      };
      const userStateCap = { tokens: 900, bonusTokens: 0 };
      const resultCap = RefundCalculator.calculateRefund(transactionCap, userStateCap, 10000);

      // Calculated refund would be (10000 / 1000) * 900 = 9000
      // But should be capped at paid amount (10000)
      const passCap = resultCap.refundAmount <= 10000;
      console.log(`✓ Refund Cap: ${passCap ? 'PASS' : 'FAIL'}`);
      console.log(`  - Refund Amount: ₹${RefundCalculator.paiseToRupees(resultCap.refundAmount)}`);
      console.log(`  - Paid Amount: ₹${RefundCalculator.paiseToRupees(10000)}`);
      console.log(`  - Capped correctly: ${resultCap.refundAmount <= 10000}\n`);
      
      results.passed += passCap ? 1 : 0;
      results.failed += passCap ? 0 : 1;
      results.tests.push({ test: 'Refund Cap', passed: passCap });
    } catch (error) {
      console.log(`✗ Refund Cap: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ test: 'Refund Cap', passed: false, error: error.message });
    }

    // Test: Currency conversion
    console.log('📋 TEST: Currency Conversion');
    try {
      const paiseToRupees = RefundCalculator.paiseToRupees(123456);
      const rupeesToPaise = RefundCalculator.rupeesToPaise(1234.56);
      const pass = paiseToRupees === '1234.56' && rupeesToPaise === 123456;
      console.log(`✓ Currency Conversion: ${pass ? 'PASS' : 'FAIL'}`);
      console.log(`  - Paise to Rupees: ${paiseToRupees} (Expected: 1234.56)`);
      console.log(`  - Rupees to Paise: ${rupeesToPaise} (Expected: 123456)\n`);
      
      results.passed += pass ? 1 : 0;
      results.failed += pass ? 0 : 1;
      results.tests.push({ test: 'Currency Conversion', passed: pass });
    } catch (error) {
      console.log(`✗ Currency Conversion: FAIL - ${error.message}\n`);
      results.failed++;
      results.tests.push({ test: 'Currency Conversion', passed: false, error: error.message });
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%\n`);

    return results;
  }

  static printScenarioExplanations() {
    console.log('\n' + '═'.repeat(60));
    console.log('📚 SCENARIO EXPLANATIONS');
    console.log('═'.repeat(60) + '\n');

    console.log('Scenario 1: Full Refund (No Bonus, All Tokens Unused)');
    console.log('├─ User buys 100 tokens for ₹1000');
    console.log('├─ User doesn\'t use any tokens');
    console.log('└─ Result: FULL REFUND ₹1000\n');

    console.log('Scenario 2: Partial Refund (No Bonus, Some Tokens Used)');
    console.log('├─ User buys 100 tokens for ₹1000');
    console.log('├─ User uses 70 tokens, 30 remaining');
    console.log('└─ Result: PARTIAL REFUND ₹300 (30% of payment)\n');

    console.log('Scenario 3: Full Refund (With Bonus, All Unused)');
    console.log('├─ User buys 100 tokens for ₹1000');
    console.log('├─ User gets 50 bonus tokens');
    console.log('├─ User doesn\'t use any tokens');
    console.log('└─ Result: FULL REFUND ₹1000\n');

    console.log('Scenario 4: Partial Refund (With Bonus, Bonus Used)');
    console.log('├─ User buys 100 tokens for ₹1000');
    console.log('├─ User gets 50 bonus tokens');
    console.log('├─ User uses 30 bonus tokens, 20 remaining');
    console.log('├─ User still has all 100 purchased tokens');
    console.log('└─ Result: PARTIAL REFUND ₹700 (70% of payment)\n');

    console.log('Scenario 5: Not Eligible / Partial (Both Pools Used)');
    console.log('├─ User buys 100 tokens for ₹1000');
    console.log('├─ User gets 50 bonus tokens');
    console.log('├─ User uses tokens from both pools');
    console.log('├─ If effective tokens < 1: NOT ELIGIBLE');
    console.log('└─ If effective tokens >= 1: PARTIAL REFUND based on calculation\n');

    console.log('═'.repeat(60) + '\n');
  }
}

// Run tests if executed directly
if (require.main === module) {
  RefundCalculatorTest.printScenarioExplanations();
  const results = RefundCalculatorTest.runAllTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = RefundCalculatorTest;
