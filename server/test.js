import fetch from "node-fetch";

let cookie = ""; // store userId cookie

// Test scenarios for each therapy type
const TEST_SCENARIOS = {
  cbt: {
    name: "Cognitive Behavioral Therapy",
    messages: [
      "I feel anxious about my job interview tomorrow.",
      "I keep thinking I'm going to mess up and they'll think I'm incompetent.",
      "I always do this - I convince myself I'll fail before I even try.",
      "What if I freeze up and can't answer their questions?",
      "You're right, I have done well in interviews before. But this one feels different."
    ]
  },
  
  somatic: {
    name: "Somatic Therapy",
    messages: [
      "I've been feeling really stressed lately and I don't know why.",
      "I guess I feel tension in my shoulders and my chest feels tight.",
      "It's hard to describe... kind of like a heavy weight on my chest.",
      "When I focus on it, it feels warm and tight, almost like it's squeezing.",
      "That actually helped a bit. The tightness feels a little less intense now."
    ]
  },
  
  psychodynamic: {
    name: "Psychodynamic Therapy",
    messages: [
      "I keep having the same argument with my partner over and over.",
      "They say I shut down emotionally whenever we disagree about something important.",
      "I guess I did see my parents argue a lot growing up. My mom would yell and my dad would just go silent.",
      "I never thought about it that way. Maybe I learned that from him.",
      "It's strange - I do the same thing at work when my boss criticizes me."
    ]
  }
};

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m"
};

async function testTherapyMode(mode, scenario) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`${colors.bright}${colors.cyan}Testing: ${scenario.name.toUpperCase()} (${mode})${colors.reset}`);
  console.log(`${"=".repeat(80)}\n`);

  // Reset cookie for each therapy mode test
  cookie = "";

  for (let i = 0; i < scenario.messages.length; i++) {
    const msg = scenario.messages[i];
    
    try {
      const res = await fetch("http://localhost:4000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookie && { Cookie: cookie })
        },
        body: JSON.stringify({
          mode: mode,
          messages: msg
        })
      });

      // Save cookie from server if first request
      const setCookie = res.headers.get("set-cookie");
      if (setCookie && !cookie) {
        cookie = setCookie.split(";")[0];
        console.log(`${colors.dim}[Session started: ${cookie}]${colors.reset}\n`);
      }

      const data = await res.json();

      // Display conversation
      console.log(`${colors.blue}${colors.bright}User (Message ${i + 1}/${scenario.messages.length}):${colors.reset}`);
      console.log(`${colors.blue}${msg}${colors.reset}\n`);
      
      console.log(`${colors.green}${colors.bright}Therapist:${colors.reset}`);
      console.log(`${colors.green}${data.output || data.error || "No response"}${colors.reset}\n`);
      
      console.log(`${colors.dim}${"-".repeat(80)}${colors.reset}\n`);

      // Small delay between messages to simulate realistic conversation
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      console.error(`${colors.yellow}⚠️  Error connecting to backend:${colors.reset}`, err.message);
      break;
    }
  }

  console.log(`${colors.cyan}✓ Completed ${scenario.name} test${colors.reset}\n`);
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.magenta}${"=".repeat(80)}`);
  console.log(`AI THERAPIST - COMPREHENSIVE TEST SUITE`);
  console.log(`${"=".repeat(80)}${colors.reset}\n`);
  
  console.log(`${colors.dim}Testing all therapy modes with realistic conversation scenarios...${colors.reset}\n`);

  // Test each therapy mode
  for (const [mode, scenario] of Object.entries(TEST_SCENARIOS)) {
    await testTherapyMode(mode, scenario);
    
    // Pause between different therapy modes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n${colors.bright}${colors.magenta}${"=".repeat(80)}`);
  console.log(`ALL TESTS COMPLETED`);
  console.log(`${"=".repeat(80)}${colors.reset}\n`);
  
  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`- CBT: ${TEST_SCENARIOS.cbt.messages.length} messages`);
  console.log(`- Somatic: ${TEST_SCENARIOS.somatic.messages.length} messages`);
  console.log(`- Psychodynamic: ${TEST_SCENARIOS.psychodynamic.messages.length} messages`);
  console.log(`${colors.dim}\nTip: Review the responses to ensure they sound natural and human-like!${colors.reset}\n`);
}

// Add option to test single mode
const args = process.argv.slice(2);
if (args.length > 0) {
  const mode = args[0].toLowerCase();
  if (TEST_SCENARIOS[mode]) {
    console.log(`\n${colors.yellow}Running single mode test: ${mode}${colors.reset}`);
    testTherapyMode(mode, TEST_SCENARIOS[mode]);
  } else {
    console.log(`\n${colors.yellow}Invalid mode. Available modes: cbt, somatic, psychodynamic${colors.reset}`);
    console.log(`Usage: node server/test.js [mode]\n`);
  }
} else {
  // Run all tests
  runAllTests();
}