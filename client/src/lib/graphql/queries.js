import { gql } from '@apollo/client'

export const jobsQuery = gql`
        query AllJobs($limit: Int, $offset: Int) {
            jobs(limit: $limit, offset: $offset) {
                items {
                    id
                    title
                    date
                    company {
                        id
                        name
                    }
                }
                totalCount
            }
        }
    `;

export const jobByIdQuery = gql`
        query JobByID($id: ID!) {
            job(id: $id) {
                id
                title
                description
                date
                company {
                    id
                    name
                }
            }
        }
    `;

export const companyByIdQuery = gql`
        query CompanyById($id: ID!) {
            company(id: $id) {
                id
                name
                description
                jobs {
                    id
                    date
                    title
                }
            }
        }
    `;
