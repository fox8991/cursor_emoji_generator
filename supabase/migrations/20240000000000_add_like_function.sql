-- Create function to toggle emoji like
create or replace function toggle_emoji_like(p_emoji_id uuid, p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_liked boolean;
  v_likes_count int;
begin
  -- Check if user has already liked the emoji
  if exists (
    select 1 from user_likes
    where emoji_id = p_emoji_id and user_id = p_user_id
  ) then
    -- Unlike: Remove the like
    delete from user_likes
    where emoji_id = p_emoji_id and user_id = p_user_id;
    
    -- Decrement likes_count
    update emojis
    set likes_count = likes_count - 1
    where id = p_emoji_id
    returning likes_count into v_likes_count;
    
    v_liked := false;
  else
    -- Like: Add new like
    insert into user_likes (emoji_id, user_id)
    values (p_emoji_id, p_user_id);
    
    -- Increment likes_count
    update emojis
    set likes_count = likes_count + 1
    where id = p_emoji_id
    returning likes_count into v_likes_count;
    
    v_liked := true;
  end if;

  return json_build_object(
    'liked', v_liked,
    'likes_count', v_likes_count
  );
end;
$$; 