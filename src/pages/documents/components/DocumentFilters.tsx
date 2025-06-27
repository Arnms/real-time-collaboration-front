import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
import { cn } from "@/utils/cn";

export interface DocumentFilters {
  search: string;
  sortBy: "title" | "updatedAt" | "createdAt";
  sortOrder: "ASC" | "DESC";
  tags: string[];
  isTemplate?: boolean;
  templateCategory?: string;
}

interface DocumentFiltersProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showTemplateFilter?: boolean;
  availableTags?: string[];
  availableCategories?: string[];
  className?: string;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  showTemplateFilter = false,
  availableTags = [],
  availableCategories = [],
  className,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 검색어 변경
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  // 정렬 변경
  const handleSortChange = (sortBy: DocumentFilters["sortBy"]) => {
    onFiltersChange({ ...filters, sortBy });
  };

  // 정렬 순서 변경
  const handleSortOrderChange = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === "ASC" ? "DESC" : "ASC",
    });
  };

  // 태그 추가/제거
  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  // 템플릿 필터 변경
  const handleTemplateFilterChange = (isTemplate: boolean | undefined) => {
    onFiltersChange({ ...filters, isTemplate });
  };

  // 카테고리 변경
  const handleCategoryChange = (templateCategory: string | undefined) => {
    onFiltersChange({ ...filters, templateCategory });
  };

  // 필터 초기화
  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      sortBy: "updatedAt",
      sortOrder: "DESC",
      tags: [],
      isTemplate: undefined,
      templateCategory: undefined,
    });
  };

  // 활성 필터 개수
  const activeFiltersCount = [
    filters.search,
    filters.tags.length > 0,
    filters.isTemplate !== undefined,
    filters.templateCategory,
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 기본 검색 및 뷰 모드 */}
      <div className="flex items-center space-x-4">
        {/* 검색 */}
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="문서 제목이나 내용을 검색하세요..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
          />
        </div>

        {/* 고급 필터 버튼 */}
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          leftIcon={<FunnelIcon className="w-4 h-4" />}
          className={cn(
            activeFiltersCount > 0 && "bg-primary-50 border-primary-200"
          )}
        >
          필터
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* 뷰 모드 전환 */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-none border-0"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-none border-0 border-l border-gray-300"
          >
            <ListBulletIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 고급 필터 */}
      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">고급 필터</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<XMarkIcon className="w-4 h-4" />}
              >
                필터 초기화
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 정렬 기준 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                정렬 기준
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as DocumentFilters["sortBy"])
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="updatedAt">마지막 수정일</option>
                <option value="createdAt">생성일</option>
                <option value="title">제목</option>
              </select>
            </div>

            {/* 정렬 순서 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                정렬 순서
              </label>
              <Button
                variant="outline"
                onClick={handleSortOrderChange}
                className="w-full justify-start"
              >
                {filters.sortOrder === "DESC" ? "내림차순" : "오름차순"}
              </Button>
            </div>

            {/* 템플릿 필터 */}
            {showTemplateFilter && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  문서 유형
                </label>
                <select
                  value={
                    filters.isTemplate === undefined
                      ? ""
                      : filters.isTemplate.toString()
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    handleTemplateFilterChange(
                      value === "" ? undefined : value === "true"
                    );
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">전체</option>
                  <option value="false">일반 문서</option>
                  <option value="true">템플릿</option>
                </select>
              </div>
            )}
          </div>

          {/* 카테고리 필터 (템플릿인 경우) */}
          {filters.isTemplate === true && availableCategories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                템플릿 카테고리
              </label>
              <select
                value={filters.templateCategory || ""}
                onChange={(e) =>
                  handleCategoryChange(e.target.value || undefined)
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">전체 카테고리</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 태그 필터 */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-full border transition-colors",
                      filters.tags.includes(tag)
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
                {availableTags.length > 10 && (
                  <span className="px-2 py-1 text-xs text-gray-400">
                    +{availableTags.length - 10} 더보기
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 활성 필터 표시 */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">활성 필터:</span>

          {filters.search && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
              검색: "{filters.search}"
            </span>
          )}

          {filters.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-green-100 text-green-700 rounded"
            >
              #{tag}
            </span>
          ))}

          {filters.isTemplate !== undefined && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {filters.isTemplate ? "템플릿" : "일반 문서"}
            </span>
          )}

          {filters.templateCategory && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
              {filters.templateCategory}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export { DocumentFiltersComponent as DocumentFilters };
