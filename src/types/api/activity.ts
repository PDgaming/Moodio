interface CreateActivityRequest {
  name: string;
  icon: string;
  color: string;
  category: string;
}

interface UpdateActivityRequest {
  name?: string;
  icon?: string;
  color?: string;
  category?: string;
}
