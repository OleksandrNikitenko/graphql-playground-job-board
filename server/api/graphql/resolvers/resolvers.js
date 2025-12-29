import { GraphQLError } from "graphql"
import { countJobs, createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob } from "../../../db/jobs.js"
import { getCompany } from "../../../db/companies.js"

export const resolvers = {
    Query: {
        job: async (_root, args) => {
            const job = await getJob(args.id);
            if (!job) {
                throw notFoundError(`No Job found with the given ID: ${args.id}`)
            }
            return job;
        },
        jobs: async (_root, args) => {
            const items = await getJobs(args.limit, args.offset);
            const totalCount = await countJobs();
            return {
                items,
                totalCount
            }
        },
        company: async (_root, args) => {
            const company = await getCompany(args.id);
            if (!company) {
                throw notFoundError(`No Company found with the given ID: ${args.id}`)
            }
            return company;
        }
    },

    Mutation: {
        createJob: (_root, { input: { title, description } }, context) => {
            if (!context.user) {
                throw unauthorizedError('Auth is missing');
            }

            return createJob({
                companyId: context.user.companyId,
                title: title,
                description: description
            })
        },
        deleteJob: async (_root, { id }) => {
            if (!context.user) {
                throw unauthorizedError('Auth is missing');
            }

            const job = await deleteJob(id, context.user.companyId);
            if (!job) {
                throw notFoundError(`No Job found with the given ID: ${args.id}`)
            }
            return job;
        },
        updateJob: async (_root, { input: { id, title, description } }, context) => {
            if (!context.user) {
                throw unauthorizedError('Auth token is missing');
            }

            const job = await updateJob({ id, title, description }, context.user.companyId)
            if (!job) {
                throw notFoundError(`No Job found with the given ID: ${args.id}`)
            }
            return job;
        }
    },

    Job: {
        date: (job) => toIsoDate(job.createdAt),
        company: (job, _args, context) => context.companyLoader.load(job.companyId),
    },

    Company: {
        jobs: (company) => getJobsByCompany(company.id),
    }
}

function toIsoDate(value) {
    return value.slice(0, 'yyyy-MM-dd'.length);
}

function notFoundError(message) {
    return new GraphQLError(message, {
        extensions: {
            code: 'NOT_FOUND'
        }
    });
}

function unauthorizedError(message) {
    return new GraphQLError(message, {
        extensions: {
            code: 'UNATHORIZED'
        }
    });
}