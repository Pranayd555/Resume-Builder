# Refund Calculation - Visual Decision Guide

> **Pools and spending order.** "Current" below means the user's two pools: purchased tokens (`tokens`, refundable) and bonus tokens (`bonusTokens`, not refundable). AI actions spend **bonus first, then purchased** (`backend/utils/tokenCalculator.js`), so bonus runs out before any purchased token is touched. Only purchased tokens are ever paid back; zero-amount bonus grants are never refundable.

## 🔄 Refund Decision Tree

```
                              ┌─ REFUND REQUEST ─┐
                              │                  │
                       ┌──────▼─────────┐
                       │  Has Bonus?    │
                       └──────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                │                           │
           NO  ▼                           ▼  YES
        ╔═══════════╗              ╔══════════════╗
        ║ NO BONUS  ║              ║ WITH BONUS   ║
        ╚═════╤═════╝              ╚══════╤═══════╝
              │                            │
              │                   ┌────────▼────────┐
              │                   │ All Tokens Used?│
              │                   └────────┬────────┘
              │                            │
              │                  ┌─────────┼─────────┐
              │              YES ▼         ▼ NO      
              │            ┌─────────┐  ┌──────────┐
              │            │Scenario │  │Scenario 3│
              │            │    3?   │  │100% REF  │
              │            └────┬────┘  └──────────┘
              │                 │
              ▼                 │
        ┌──────────┐            │
        │ Balance  │            │
        │ >= Bought│            │
        └────┬─────┘            │
             │                  │
        ┌────┴────┐             │
       YES       NO             │
        │         │             │
    ┌───▼──┐  ┌───▼───────┐   │
    │Scn 1 │  │Scenario 2 │   │
    │100%  │  │Partial %  │   │
    │REFUN │  │REFUND     │   │
    └──────┘  └───────────┘   │
                               │
          ┌────────────────────┘
          │
          ▼
    ┌──────────────────┐
    │ Purchased Tokens │
    │   All Used?      │
    └────────┬─────────┘
             │
        ┌────┴────┐
       YES       NO
        │         │
    ┌───▼──┐  ┌───▼────┐
    │Scn 4 │  │Scn 5/6 │
    │Partial│  │Check   │
    │deduct │  │<1 token│
    │bonus  │  │?       │
    └───────┘  └───┬────┘
                   │
                ┌──┴──┐
              YES    NO
               │      │
          ┌────▼─┐ ┌──▼────┐
          │NOT   │ │Partial│
          │ELIG. │ │REFUND │
          │EMAIL │ │(Scn5B)│
          └──────┘ └───────┘
```

---

## 📋 Scenario Flow Details

### BRANCH 1: NO BONUS PATH

```
            SCENARIO 1 vs 2
         (No Bonus Branch)
                │
        ┌───────▼────────┐
        │ Current Tokens │
        │  >= Purchased? │
        └───────┬────────┘
                │
           ┌────┴────┐
          YES       NO
           │         │
    ┌──────▼──┐  ┌───▼──────────┐
    │SCENARIO 1│  │ SCENARIO 2   │
    │          │  │              │
    │Full ₹    │  │Partial ₹     │
    │Refund    │  │Refund        │
    │(100%)    │  │              │
    │          │  │Calculation:  │
    │Status:   │  │(Paid ÷ Bought)│
    │eligible  │  │× Current      │
    │          │  │              │
    │Action:   │  │Example:      │
    │Process ₹ │  │(1000÷100)×30 │
    │via RZP   │  │= ₹300 (30%)  │
    │Send      │  │              │
    │Complete  │  │Status:       │
    │Email     │  │eligible      │
    │          │  │              │
    └──────────┘  │Action:       │
                  │Process ₹     │
                  │via RZP       │
                  │Send Complete │
                  │Email         │
                  └───────────────┘
```

---

### BRANCH 2: WITH BONUS PATH - ALL TOKENS

```
            SCENARIO 3
     (With Bonus - All Unused)
                │
         ┌──────▼─────────┐
         │Current Regular │
         │>= Purchased?   │
         └────────┬───────┘
                  │
              ┌───┴───┐
             YES     NO
              │       │
              │   ┌───▼────────┐
              │   │ Check Bonus│
              │   │ >= Added?  │
              │   └──────┬─────┘
              │          │
              │          ├─ YES ─┐
              │          │       │
              │          │   ┌───▼──────────┐
              │          │   │SCENARIO 3    │
              │          │   │              │
              │    ┌─────▼─┐ │Full ₹ Refund │
              │    │Scn 4? │ │(100%)        │
              │    └───────┘ │              │
              │              │Status:       │
              │          ┌───┴──────────────┐
              │          │eligible          │
              │     ┌────▼─────────┐
              │     │ Purchased    │
              │     │ Tokens All   │
              │     │ Intact?      │
              │     └──┬──────┬────┘
              │        │      │
              │       YES     NO
              │        │      │
              │  ┌─────▼──┐   │
              │  │Scenario │   │
              │  │  4      │   │
              │  │         │   │
              │  │Bonus    │   │
              │  │Used:    │   │
              │  │50-20=30 │   │
              │  │         │   │
              │  │Effective│   │
              │  │=100-30  │   │
              │  │=70      │   │
              │  │         │   │
              │  │₹700 ref │   │
              │  │(70%)    │   │
              │  │         │   │
              │  │Status:  │   │
              │  │eligible │   │
              │  │         │   │
              │  │Send     │   │
              │  │Complete │   │
              │  │Email    │   │
              │  └─────────┘   │
              │                │
              │          ┌─────▼──────┐
              │          │Go to Scn 5 │
              │          │ (Both Used)│
              │          └────────────┘
              │
         ┌────▼────────────┐
         │SCENARIO 3       │
         │Full ₹ Refund    │
         │(100%)           │
         │                 │
         │Status: eligible │
         │                 │
         │Send Complete    │
         │Email            │
         └─────────────────┘
```

---

### BRANCH 3: BOTH TOKENS USED (Scenarios 5A & 5B)

```
         SCENARIO 5 & 6
    (Both Pools Used)
           │
      ┌────▼────────────────┐
      │ Calculate Effective │
      │ Tokens for Refund   │
      │                     │
      │ bonusUsed =         │
      │  (50 - current)     │
      │                     │
      │ effective =         │
      │  current - bonusUsed│
      └────┬────────────────┘
           │
      ┌────▼──────────────┐
      │ Effective Tokens │
      │    >= 1 ?        │
      └────┬──────┬──────┘
           │      │
          YES     NO
           │      │
    ┌──────▼──┐ ┌──▼──────────────┐
    │SCENARIO │ │SCENARIO 5A      │
    │  5B     │ │                 │
    │         │ │NOT ELIGIBLE     │
    │Partial  │ │                 │
    │Refund   │ │Status:          │
    │         │ │not_eligible     │
    │Example: │ │                 │
    │Curr: 60 │ │Reason:          │
    │Bonus: 5 │ │Insufficient     │
    │BonusUsed│ │unused tokens    │
    │= 45     │ │                 │
    │Eff=15   │ │Send Not-        │
    │         │ │Eligible Email   │
    │Refund:  │ │with Details     │
    │(1000÷100│ │                 │
    │×15)     │ │Token Breakdown: │
    │= ₹150   │ │• Bought: 100    │
    │         │ │• Bonus: 50      │
    │Status:  │ │• Current: 40    │
    │eligible │ │• Available: 0   │
    │         │ │                 │
    │Send     │ └─────────────────┘
    │Complete │
    │Email    │
    └─────────┘
```

---

### BRANCH 4: PURCHASED USED, BONUS STILL COVERED (Scenario 6)

```
   Current purchased < bought  AND  current bonus >= this purchase's bonus
   (bonus was topped up later, e.g. a feedback reward)
           │
      ┌────▼──────────────────────┐
      │ No bonus from this        │
      │ purchase counts as used:  │
      │ effective = current       │
      │             purchased     │
      └────┬──────────────────────┘
           │
      ┌────▼──────────────┐
      │ Purchased >= 1 ?  │
      └────┬──────┬───────┘
          YES     NO
           │      │
   ┌───────▼──┐ ┌─▼────────────┐
   │ Partial  │ │ NOT ELIGIBLE │
   │ refund   │ └──────────────┘
   │ Example: │
   │ 100+50,  │
   │ curr 40  │
   │ bonus 60 │
   │ = ₹400   │
   └──────────┘
```

---

## 🎯 Quick Reference Table

### Decision Points

| Question | If YES | If NO |
|----------|--------|-------|
| Has bonus tokens added? | Go to "With Bonus" | Go to "No Bonus" |
| Current balance >= bought? | Scenario 1 (100%) | Check balance < bought |
| All current tokens used? | Check purchased tokens | Scenario 5/6 |
| Purchased tokens all intact? | Scenario 4 (calc bonus) | Scenario 5/6 |
| Effective tokens >= 1? | Scenario 5B (calc %) | Scenario 5A (not eligible) |
| Purchased used but bonus >= bonus added? | Scenario 6 (refund unused purchased) | Scenario 5 |

---

## 💰 Refund Amount Calculations

### No Bonus Path
```
If Balance >= Bought:
├─ Result: Scenario 1 ✓
└─ Refund: 100%

If Balance < Bought:
├─ Result: Scenario 2 ✓
├─ Formula: (Paid ÷ Bought) × Current
└─ Example: (₹1000 ÷ 100) × 30 = ₹300
```

### With Bonus Path
```
If All Unused:
├─ Result: Scenario 3 ✓
└─ Refund: 100%

If Some Bonus Used:
├─ Result: Scenario 4 ✓
├─ Bonus Used = Added - Current
├─ Effective = Bought - Bonus Used
├─ Formula: (Paid ÷ Bought) × Effective
└─ Example: (₹1000 ÷ 100) × 70 = ₹700

If Both Used:
├─ Effective = Current - (Added - Current)
├─ If Effective < 1: Scenario 5A (Not Eligible)
├─ If Effective >= 1: Scenario 5B (Partial)
└─ Formula: (Paid ÷ Bought) × Effective

If Purchased Used, Bonus Still >= Added:
├─ Result: Scenario 6
├─ Formula: (Paid ÷ Bought) × Current purchased
└─ If Current purchased < 1: Not Eligible
```

---

## 📊 Scenario Summary Matrix

```
╔════╦═══════════╦══════════╦════════════╦══════════════════════════════════════╗
║ S# ║ Condition ║ Bonus    ║ Tokens     ║ Result                               ║
║    ║           ║ Impact   ║ Status     ║                                      ║
╠════╬═══════════╬══════════╬════════════╬══════════════════════════════════════╣
║ 1  ║ No Bonus  ║ N/A      ║ All        ║ 100% Refund (ELIGIBLE) ✓              ║
║    ║ Balance   ║          ║ Unused     ║ Send Completion Email                ║
║    ║ >= Bought ║          ║            ║                                      ║
╠════╬═══════════╬══════════╬════════════╬══════════════════════════════════════╣
║ 2  ║ No Bonus  ║ N/A      ║ Some       ║ Partial Refund (ELIGIBLE) ✓           ║
║    ║ Balance   ║          ║ Used       ║ Amount: (Paid÷Bought)×Current        ║
║    ║ < Bought  ║          ║            ║ Send Completion Email                ║
╠════╬═══════════╬══════════╬════════════╬══════════════════════════════════════╣
║ 3  ║ With      ║ All      ║ All        ║ 100% Refund (ELIGIBLE) ✓              ║
║    ║ Bonus     ║ Available║ Unused     ║ Send Completion Email                ║
║    ║           ║          ║            ║                                      ║
╠════╬═══════════╬══════════╬════════════╬══════════════════════════════════════╣
║ 4  ║ With      ║ Some     ║ Purchased  ║ Partial Refund (ELIGIBLE) ✓           ║
║    ║ Bonus     ║ Used     ║ All        ║ Amount: (Paid÷Bought)×(B-BU)         ║
║    ║           ║          ║ Intact     ║ Send Completion Email                ║
╠════╬═══════════╬══════════╬════════════╬══════════════════════════════════════╣
║ 5  ║ With      ║ Some     ║ Both Used  ║ NOT ELIGIBLE ✗ (if <1 token)         ║
║ A  ║ Bonus     ║ Used     ║ Effective  ║ Send Not-Eligible Email              ║
║    ║           ║          ║ < 1 token  ║                                      ║
╠════╬═══════════╬══════════╬════════════╬══════════════════════════════════════╣
║ 5  ║ With      ║ Some     ║ Both Used  ║ Partial Refund (ELIGIBLE) ✓           ║
║ B  ║ Bonus     ║ Used     ║ Effective  ║ Amount: (Paid÷Bought)×Effective      ║
║    ║           ║          ║ >= 1 token ║ Send Completion Email                ║
╚════╩═══════════╩══════════╩════════════╩══════════════════════════════════════╝
```

---

## 🔔 Email Actions

### Send Completion Email When:
- ✅ Scenario 1 (100% eligible)
- ✅ Scenario 2 (Partial eligible)
- ✅ Scenario 3 (100% eligible)
- ✅ Scenario 4 (Partial eligible)
- ✅ Scenario 5B (Partial eligible)

### Send Not-Eligible Email When:
- ❌ Scenario 5A (Not eligible - insufficient tokens)

---

## 🧮 Example Walkthroughs

### Example 1: Scenario 2
```
┌─────────────────────────────────┐
│ User Purchase Details           │
├─────────────────────────────────┤
│ Amount Paid: ₹1000              │
│ Tokens Bought: 100              │
│ Bonus Added: 0                  │
│ Price per Token: ₹10            │
├─────────────────────────────────┤
│ Current Balance                 │
├─────────────────────────────────┤
│ Tokens: 30                      │
│ Bonus: 0                        │
├─────────────────────────────────┤
│ Decision Flow                   │
├─────────────────────────────────┤
│ 1. Has Bonus? → NO              │
│ 2. Balance >= 100? → NO (only 30│
│ 3. Apply Scenario 2             │
│                                 │
│ Refund = (1000 ÷ 100) × 30      │
│ Refund = 10 × 30                │
│ Refund = ₹300                   │
│ Percentage: 30%                 │
│                                 │
│ Status: ELIGIBLE ✓              │
│ Action: Process ₹300 refund     │
│ Email: Send completion email    │
└─────────────────────────────────┘
```

### Example 2: Scenario 5A
```
┌─────────────────────────────────┐
│ User Purchase Details           │
├─────────────────────────────────┤
│ Amount Paid: ₹1000              │
│ Tokens Bought: 100              │
│ Bonus Added: 50                 │
│ Price per Token: ₹10            │
├─────────────────────────────────┤
│ Current Balance                 │
├─────────────────────────────────┤
│ Tokens: 40                      │
│ Bonus: 10 (40 bonus used)       │
├─────────────────────────────────┤
│ Decision Flow                   │
├─────────────────────────────────┤
│ 1. Has Bonus? → YES             │
│ 2. All Used? → YES              │
│ 3. Both Used                    │
│                                 │
│ Bonus Used = 50 - 10 = 40       │
│ Effective = 40 - 40 = 0         │
│ Check: Effective >= 1? → NO     │
│                                 │
│ Status: NOT ELIGIBLE ✗          │
│ Action: No refund processed     │
│ Email: Send not-eligible email  │
│         with policy details     │
└─────────────────────────────────┘
```

---

## 📌 Important Notes

1. **Token Threshold**: Must have >= 1 token worth of value to be eligible
2. **Bonus Calculation**: `bonusUsed = bonusAdded - currentBonus`
3. **Effective Tokens**: `effective = currentTokens - bonusUsed`
4. **Refund Cap**: Never exceeds the amount originally paid
5. **7-Day Window**: Refund requests only valid within 7 days (admin checks)

---

## 🔄 Process Flow Summary

```
Refund Request
    ↓
Calculate Refund Amount
    ↓
Check Eligibility
    ├─ ELIGIBLE ✓
    │   ↓
    │   Process via Razorpay
    │   ↓
    │   Send Completion Email
    │   ↓
    │   Update Transaction Status
    │
    └─ NOT ELIGIBLE ✗
        ↓
        Send Not-Eligible Email
        ↓
        Update Transaction Status
        ↓
        Suggest Support Contact
```

---

Created: October 31, 2025
Last Updated: October 31, 2025
