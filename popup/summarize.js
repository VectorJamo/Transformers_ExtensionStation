// ─── summarize.js — Summarize Section ───────────────────────

function initSummarize() {

  document.getElementById("summarizeBtn").addEventListener("click", async () => {
    let minWords = parseInt(document.getElementById("minWords").value);
    let maxWords = parseInt(document.getElementById("maxWords").value);

    if (minWords < 20) {
      alert("Summary cannot be under 20 words.");
      return;
    }
    if (minWords > maxWords) {
      alert("Min words cannot be greater than max words.");
      return;
    }

    document.getElementById("loader").style.display = "block";
    document.getElementById("summaryOutput").innerHTML = "";  // ✅ was .summary-output
    document.getElementById("summaryOutput").style.display = "none";

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getText" }, function (response) {
      setTimeout(() => {
        if (!response?.text) {
          document.getElementById("loader").style.display = "none";
          document.getElementById("summaryOutput").style.display = "block";
          document.getElementById("summaryOutput").innerHTML = "⚠️ Could not read page. Try refreshing.";
          return;
        }
        let summary = generateSummary(response.text, minWords, maxWords);
        document.getElementById("loader").style.display = "none";
        document.getElementById("summaryOutput").style.display = "block";  // ✅ was .summary-output
        document.getElementById("summaryOutput").innerHTML = "<p>" + summary + "</p>";
      }, 500);
    });
  });

  function generateSummary(text, minWords, maxWords) {
    let stopWords = ["the","is","and","of","to","a","in","that","it","on","for","with","as","was","are","this","by","an"];
    let sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (!sentences) return "Not enough content to summarize.";

    let wordFreq = {};
    let words = text.toLowerCase().split(/\W+/);
    words.forEach(word => {
      if (!stopWords.includes(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    let maxFreq = Math.max(...Object.values(wordFreq));
    for (let word in wordFreq) {
      wordFreq[word] = wordFreq[word] / maxFreq;
    }

    let scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      sentence.toLowerCase().split(/\W+/).forEach(word => {
        if (wordFreq[word]) score += wordFreq[word];
      });
      return { sentence: sentence.trim(), score, index };
    });

    scoredSentences.sort((a, b) => b.score - a.score);

    let finalSummary = [];
    let totalWords = 0;
    for (let s of scoredSentences) {
      let wordCount = s.sentence.split(" ").length;
      if (totalWords + wordCount <= maxWords) {
        finalSummary.push(s);
        totalWords += wordCount;
      }
      if (totalWords >= minWords) break;
    }

    if (totalWords < minWords) {
      return "Not enough content to generate summary within selected range.";
    }

    finalSummary.sort((a, b) => a.index - b.index);
    return finalSummary.map(s => s.sentence).join(" ");
  }
}