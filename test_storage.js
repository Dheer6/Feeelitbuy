// Test file to verify Supabase storage bucket is accessible
// Run this in browser console to test

async function testStorageBucket() {
  console.log('Testing storage bucket access...');
  
  try {
    const { supabase } = await import('./lib/supabase');
    
    // Step 1: Check available buckets
    console.log('Step 1: Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Available buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));
    
    const reviewBucket = buckets?.find(b => b.id === 'reviews');
    if (!reviewBucket) {
      console.error('❌ Reviews bucket not found!');
      return;
    }
    
    console.log('✅ Found reviews bucket:', reviewBucket);
    
    // Step 2: Try to upload a test file
    console.log('Step 2: Testing file upload...');
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reviews')
      .upload(`test/${Date.now()}.txt`, testFile);
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return;
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // Step 3: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reviews')
      .getPublicUrl(`test/${Date.now()}.txt`);
    
    console.log('✅ Public URL:', publicUrl);
    
    console.log('\n✅ All tests passed! Storage bucket is working.');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

// Run the test
testStorageBucket();
