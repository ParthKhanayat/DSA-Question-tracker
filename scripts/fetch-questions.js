import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://leetcode.com/api/problems/algorithms/';
const outPath = path.join(process.cwd(), 'src', 'data', 'questions.json');

console.log('Fetching LeetCode questions...');

https.get(url, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const problems = data.stat_status_pairs;
      
      const formattedProblems = problems.map(p => ({
        id: p.stat.frontend_question_id,
        title: p.stat.question__title,
        slug: p.stat.question__title_slug,
        difficulty: p.difficulty.level // 1: Easy, 2: Medium, 3: Hard
      }));

      // Sort by ID
      formattedProblems.sort((a, b) => a.id - b.id);

      // Create dir if not exists
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(formattedProblems, null, 2));

      console.log(`Successfully saved ${formattedProblems.length} questions to ${outPath}`);
    } catch (error) {
      console.error('Error parsing response:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('Error fetching data:', error.message);
});
