import React from 'react';

const Table = ({ jsonResponse }) => {
  // Parse the JSON string
  const result = JSON.parse(jsonResponse);

  // Extract the tags and confidence from the parsed JSON
  const tags = result?.result?.result?.tags || [];
  const tagsAndConfidence = tags.slice(0, 5).map(({ tag, confidence }) => ({ tag: tag.en, confidence }));

  return (
    <div>
      <h2>Classification Table</h2>
      <table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {tagsAndConfidence.map((item, index) => (
            <tr key={index}>
              <td>{item.tag}</td>
              <td>{item.confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
