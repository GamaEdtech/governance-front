'use client' // only in App Router

import React from 'react'
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react'

const Editor = () => {
  const LICENSE_KEY =
    'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzQ1NjYzOTksImp0aSI6Ijc5M2E4YTFkLTQ0MDMtNDliMC1iMDE3LTUwMmZmMzAyYjQxNSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjRkYzlhNGEyIn0.Vs7uK8Lcb_5wjAwIhj32woGen9ROLaydOEyYwK76QW6dPfNtwdACdvm0roF70M7TBOJ7fBiR-JghDO3xhuCLcw'

  const cloud = useCKEditorCloud({
    version: '44.0.0',
    premium: true
  })

  if (cloud.status === 'error') {
    return <div>Error!</div>
  }

  if (cloud.status === 'loading') {
    return <div>Loading...</div>
  }

  const { ClassicEditor, Essentials, Paragraph, Bold, Italic, FontColor } =
    cloud.CKEditor

  return (
    <CKEditor
      editor={ClassicEditor}
      data={''}
      config={{
        licenseKey: LICENSE_KEY,
        plugins: [Essentials, Paragraph, Bold, Italic, FontColor],
        toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'fontColor'],
        fontColor: {
          colors: [
            {
              color: '#000000', // Default black
              label: 'Black'
            },
            {
              color: '#FF0000',
              label: 'Red'
            }
          ],
          
        },
        
      }}
    />
  )
}

export default Editor
