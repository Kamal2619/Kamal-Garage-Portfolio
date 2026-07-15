import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const brandWorkType = defineType({
  name: 'brandWork',
  title: 'Brand Work (Project)',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "brandWork" }),
    defineField({
      name: 'title',
      title: 'Brand / Project Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Designer Me', value: 'designer'},
          {title: 'Developer Me', value: 'developer'},
          {title: 'Creator Me', value: 'creator'}
        ]
      },
      validation: (rule) => rule.required(),
    }),
    
    // --- HOME PAGE DATA ---
    defineField({
      name: 'clientLogo',
      title: 'Client Logo (For Home Marquee)',
      type: 'image',
    }),
    defineField({
      name: 'feedbackQuote',
      title: 'Client Feedback Quote (For Home Feedback)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
            {title: 'Left Align', value: 'leftAlign'},
            {title: 'Center Align', value: 'centerAlign'},
            {title: 'Right Align', value: 'rightAlign'},
            {title: 'Justify Text', value: 'justifyText'},
          ]
        }
      ]
    }),
    defineField({
      name: 'clientName',
      title: 'Client Name (For Feedback)',
      type: 'string',
    }),
    defineField({
      name: 'clientRole',
      title: 'Client Role / Company (For Feedback)',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Feedback Rating (1-5)',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(5),
    }),

    // --- CASE STUDY PAGE DATA ---
    defineField({
      name: 'thumbnail',
      title: 'Project Thumbnail (For Works List)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'projectTag',
      title: 'Project Tag (e.g. PROJECT 04)',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Project Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
    }),
    defineField({
      name: 'focusArea',
      title: 'Focus Area',
      type: 'string',
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'string',
    }),
    defineField({
      name: 'challenge',
      title: 'The Challenge',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
            {title: 'Left Align', value: 'leftAlign'},
            {title: 'Center Align', value: 'centerAlign'},
            {title: 'Right Align', value: 'rightAlign'},
            {title: 'Justify Text', value: 'justifyText'},
          ]
        }
      ]
    }),
    defineField({
      name: 'solution',
      title: 'The Solution',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
            {title: 'Left Align', value: 'leftAlign'},
            {title: 'Center Align', value: 'centerAlign'},
            {title: 'Right Align', value: 'rightAlign'},
            {title: 'Justify Text', value: 'justifyText'},
          ]
        }
      ]
    }),
    defineField({
      name: 'gallery',
      title: 'Project Gallery (Images & Media for Right Column)',
      type: 'array',
      of: [
        {type: 'image'},
        {type: 'file', title: 'Video / Audio / Document File', options: { storeOriginalFilename: true }}
      ],
    }),
    defineField({
      name: 'projectFiles',
      title: 'Additional Project Files (Audio, Video, PDF, ZIP)',
      type: 'array',
      of: [{type: 'file', options: { storeOriginalFilename: true }}],
      description: 'Upload any other file formats here.'
    }),
  ],
})
