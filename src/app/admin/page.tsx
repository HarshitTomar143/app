'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
          Manage exam sections and questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card>
          <CardHeader>
            <CardTitle>Add New Section</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name</Label>
                <Input id="sectionName" placeholder="e.g., Physics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input id="questionCount" type="number" placeholder="e.g., 25" />
              </div>
              <Button type="submit" className="w-full">Add Section</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No sections added yet.</p>
            {/* Existing sections will be listed here */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
