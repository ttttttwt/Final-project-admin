/**
 * Course List Page
 * Displays a paginated, searchable, and filterable list of all courses
 * Available to ADMIN and CONTENT_MANAGER roles
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CourseTable } from "../components/CourseTable";
import { useCourses } from "../hooks/useCourses";
import type { CEFRLevel, CourseSearchParams } from "../types/course.types";

/**
 * CourseListPage - Main page for course management
 */
export function CourseListPage() {
  const navigate = useNavigate();

  // Search and filter state
  const [params, setParams] = useState<CourseSearchParams>({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });
  const [searchInput, setSearchInput] = useState("");

  // Fetch courses
  const { data, isLoading, error } = useCourses(params);

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      title: value || undefined,
    }));
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setParams((prev) => ({
      ...prev,
      page: 0,
      title: undefined,
    }));
  };

  // Handle CEFR level filter change
  const handleCEFRChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      cefrLevel: value === "all" ? undefined : (value as CEFRLevel),
    }));
  };

  // Handle publish status filter change
  const handlePublishStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 0,
      isPublished: value === "all" ? undefined : value === "published",
    }));
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, size: number) => {
    setParams((prev) => ({
      ...prev,
      page,
      size,
    }));
  };

  // Error state
  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load courses
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage courses, sections, and content
          </p>
        </div>
        <Button onClick={() => navigate("/courses/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            {/* CEFR Level Filter */}
            <Select
              value={params.cefrLevel || "all"}
              onValueChange={handleCEFRChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by CEFR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="A1">A1 - Beginner</SelectItem>
                <SelectItem value="A2">A2 - Elementary</SelectItem>
                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                <SelectItem value="C1">C1 - Advanced</SelectItem>
                <SelectItem value="C2">C2 - Proficiency</SelectItem>
              </SelectContent>
            </Select>

            {/* Publish Status Filter */}
            <Select
              value={
                params.isPublished === undefined
                  ? "all"
                  : params.isPublished
                  ? "published"
                  : "draft"
              }
              onValueChange={handlePublishStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Courses
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.totalElements} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CourseTable
            courses={data?.content || []}
            pagination={{
              pageIndex: data?.number || 0,
              pageSize: data?.size || 10,
              totalPages: data?.totalPages || 0,
              totalElements: data?.totalElements || 0,
            }}
            onPaginationChange={handlePaginationChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseListPage;
