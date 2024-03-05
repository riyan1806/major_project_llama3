import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Table1 = ({jsonResponse}) => {

  const result = JSON.parse(jsonResponse);

  // Extract the tags and confidence from the parsed JSON
  const tags = result?.result?.result?.tags || [];
  const tagsAndConfidence = tags.slice(0, 5).map(({ tag, confidence }) => ({ tag: tag.en, confidence }));

  return (
    <div>
        <Table>
                  <TableCaption>Classification Confidence Tag Table</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {tagsAndConfidence.map((item, index) => (
                    <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.tag}</TableCell>
                    <TableCell>{item.confidence}</TableCell>
                    </TableRow>
                ))}
                  </TableBody>
                </Table>
    </div>
  )
}

export default Table1
