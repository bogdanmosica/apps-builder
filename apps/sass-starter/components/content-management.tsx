'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { formatDate } from '@/lib/utils/date-utils';
import { CreatePostDialog } from './create-post-dialog';
import { ContentFilters } from './content-filters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  User,
  Tag,
  FileText,
  Image,
  Video,
  File,
  Clock,
  Globe,
  Users,
  Heart,
  MessageSquare,
  Share2,
  BookOpen,
  Folder,
  FolderOpen,
  Upload,
  Download,
  Archive,
  Star,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
} from 'lucide-react';

// Types for our data
type ContentData = {
  posts: any[];
  categories: any[];
  media: any[];
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalComments: number;
    totalCategories: number;
  };
  recentActivity: any[];
};

// Mock CMS data - replaced with real data from props
// const cmsData = { ... };

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>{title}</p>
            <p className='text-2xl font-bold text-gray-900'>{value}</p>
            {change && (
              <p className='text-sm text-green-600 flex items-center mt-1'>
                <TrendingUp className='h-3 w-3 mr-1' aria-hidden="true" />
                {change}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function PostRow({
  post,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  post: any;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <TableRow>
      <TableCell>
        <div className='flex items-center space-x-3'>
          <div className='flex-shrink-0'>
            {post.isFeatured && <Star className='h-4 w-4 text-yellow-500' />}
          </div>
          <div>
            <div className='font-medium text-gray-900'>{post.title}</div>
            <div className='text-sm text-gray-500'>{post.excerpt}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={statusColors[post.status as keyof typeof statusColors]}
        >
          {post.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-1'>
          <User className='h-3 w-3 text-gray-400' />
          <span className='text-sm'>{post.author?.name || 'Unknown'}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant='outline'>{post.category?.name || 'Uncategorized'}</Badge>
      </TableCell>
      <TableCell>
        <div className='flex flex-wrap gap-1'>
          {(post.tags || []).slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant='secondary' className='text-xs'>
              {tag}
            </Badge>
          ))}
          {(post.tags || []).length > 2 && (
            <Badge variant='secondary' className='text-xs'>
              +{(post.tags || []).length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-4 text-sm text-gray-500'>
          <div className='flex items-center space-x-1'>
            <Eye className='h-3 w-3' />
            <span>{post.views}</span>
          </div>
          <div className='flex items-center space-x-1'>
            <MessageSquare className='h-3 w-3' />
            <span>{post.commentCount || 0}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {post.publishedAt && (
          <div className='flex items-center space-x-1 text-sm text-gray-500'>
            <Calendar className='h-3 w-3' />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className='h-4 w-4 mr-2' />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className='h-4 w-4 mr-2' />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className='text-red-600'>
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function MediaCard({ media }: { media: any }) {
  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className='h-8 w-8 text-blue-500' />;
    } else if (mimeType.startsWith('video/')) {
      return <Video className='h-8 w-8 text-red-500' />;
    } else {
      return <File className='h-8 w-8 text-gray-500' />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          {getIcon(media.mimeType)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>
                <Eye className='h-4 w-4 mr-2' />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className='h-4 w-4 mr-2' />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className='h-4 w-4 mr-2' />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className='font-medium text-gray-900 truncate'>{media.name}</h3>
        <div className='text-sm text-gray-500 space-y-1'>
          <p>{formatFileSize(media.size)}</p>
          <span>{formatDate(media.createdAt)}</span>
          {media.dimensions && <p>{media.dimensions}</p>}
          {media.duration && <p>{Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBadge({
  category,
}: {
  category: any;
}) {
  return (
    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
      <div className='flex items-center space-x-3'>
        <div className={`w-3 h-3 rounded-full ${category.color}`} />
        <span className='font-medium text-gray-900'>{category.name}</span>
      </div>
      <Badge variant='secondary'>{category.postCount || 0}</Badge>
    </div>
  );
}

export default function ContentManagement({ contentData }: { contentData: ContentData }) {
  return (
    <TooltipProvider>
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Content Management
            </h1>
            <p className='text-gray-600'>
              Create, manage, and organize your content
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='sm'>
              <Upload className='h-4 w-4 mr-2' />
              Import
            </Button>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
            <CreatePostDialog categories={contentData.categories} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'>
          <StatCard
            title='Total Posts'
            value={contentData.stats.totalPosts}
            icon={FileText}
            change='+12%'
            color='text-blue-600'
          />
          <StatCard
            title='Published'
            value={contentData.stats.publishedPosts}
            icon={Globe}
            change='+8%'
            color='text-green-600'
          />
          <StatCard
            title='Drafts'
            value={contentData.stats.draftPosts}
            icon={Edit}
            color='text-yellow-600'
          />
          <StatCard
            title='Total Views'
            value={contentData.stats.totalViews.toLocaleString()}
            icon={Eye}
            change='+24%'
            color='text-purple-600'
          />
          <StatCard
            title='Comments'
            value={contentData.stats.totalComments.toLocaleString()}
            icon={MessageSquare}
            change='+18%'
            color='text-orange-600'
          />
          <StatCard
            title='Categories'
            value={contentData.stats.totalCategories}
            icon={Tag}
            color='text-red-600'
          />
        </div>

        <Tabs defaultValue='posts' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='posts'>Posts</TabsTrigger>
            <TabsTrigger value='categories'>Categories</TabsTrigger>
            <TabsTrigger value='media'>Media Library</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='posts' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>
                      Manage your blog posts and pages
                    </CardDescription>
                  </div>
                  <ContentFilters 
                    onSearchChange={(query) => console.log('Search:', query)}
                    onStatusChange={(status) => console.log('Status:', status)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentData.posts.map((post) => (
                      <PostRow
                        key={post.id}
                        post={post}
                        onEdit={() => console.log('Edit post', post.id)}
                        onDelete={() => console.log('Delete post', post.id)}
                        onDuplicate={() =>
                          console.log('Duplicate post', post.id)
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='categories' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Organize your content with categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {contentData.categories.map((category) => (
                      <CategoryBadge key={category.id} category={category} />
                    ))}
                  </div>
                  <Button className='w-full mt-4' variant='outline'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Category
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest content activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {contentData.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className='flex items-start space-x-3'
                      >
                        <div className='flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900'>
                            {activity.title}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {activity.description}
                          </p>
                          <div className='flex items-center space-x-2 text-xs text-gray-400 mt-1'>
                            <span>{activity.user}</span>
                            <span>•</span>
                            <span>{formatDate(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='media' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Media Library</CardTitle>
                    <CardDescription>
                      Manage your images, videos, and documents
                    </CardDescription>
                  </div>
                  <Button>
                    <Upload className='h-4 w-4 mr-2' />
                    Upload Media
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {contentData.media.map((media) => (
                    <MediaCard key={media.id} media={media} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {contentData.posts
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map((post) => (
                        <div
                          key={post.id}
                          className='flex items-center justify-between'
                        >
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {post.title}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {post.category?.name || 'Uncategorized'}
                            </p>
                          </div>
                          <div className='text-sm font-medium text-gray-900'>
                            {post.views}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {contentData.categories.map((category) => (
                      <div
                        key={category.id}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center space-x-2'>
                          <div
                            className={`w-3 h-3 rounded-full ${category.color}`}
                          />
                          <span className='text-sm font-medium'>
                            {category.name}
                          </span>
                        </div>
                        <span className='text-sm text-gray-500'>
                          {category.postCount || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publishing Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8'>
                    <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500'>No scheduled posts</p>
                    <Button variant='outline' size='sm' className='mt-2'>
                      Schedule Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
