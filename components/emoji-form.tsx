"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(200, "Prompt is too long"),
});

interface EmojiFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function EmojiForm({ onSubmit, isLoading }: EmojiFormProps): React.ReactElement {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>): Promise<void> => {
    await onSubmit(values.prompt);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emoji Prompt</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Describe your emoji..." 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Emoji"}
        </Button>
      </form>
    </Form>
  );
} 