import React, { useState } from "react";
import { Link } from "react-router-dom";
import HyperText from "./hypertext.js";
import classnames from "classnames";
import { ago, storageUrl } from "./browse";
import { functions } from "../api.js";

export function Post({
  submission,
  voteFromBrowse,
  browseVotes,
  report,
  redundent_parent_id,
  redundent_child_id,
}) {
  let [nextPost, setNextPost] = useState(null);
  let [childrenPosts, setChildrenPosts] = useState(null);
  let displayTime = new Date(submission.data.timestamp).toLocaleDateString();
  let msAgo =
    new Date().getTime() - new Date(submission.data.timestamp).getTime();

  if (msAgo < 24 * 60 * 60 * 1000) {
    displayTime = ago.format(submission.data.timestamp);
  }

  function fetchParent() {
    fetch(
      functions._url(`api/creations/${submission.data.parent_id.slice(0, 20)}`),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        // detail endpoint returns the 32-char data_id; list posts use the 20-char public id
        setNextPost({ id: data.id.slice(0, 20), data });
      })
      .catch((e) => console.error(e));
  }

  function fetchChildren() {
    fetch(functions._url(`api/creations?parent=${submission.data.id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setChildrenPosts(data.filter(({ id }) => id !== redundent_child_id));
      })
      .catch((e) => console.error(e));
  }

  const hasParent = submission.data?.parent_id;
  return (
    <div className="thread">
      {nextPost && (
        <Post
          submission={nextPost}
          voteFromBrowse={voteFromBrowse}
          browseVotes={browseVotes}
          report={report}
          redundent_child_id={submission.id}
        />
      )}
      <div
        key={submission.id}
        className={classnames("submission", {
          expandedTop: nextPost,
          expandedBottom: childrenPosts,
        })}
      >
        <Link
          className="img-link"
          to={{
            pathname: "/",
            hash: `#${submission.id.slice(0, 20)}`,
          }}
          onClick={() => {
            window.UI.setState(
              () => ({
                currentSubmission: null,
              }),
              window.UI.load
            );
          }}
        >
          <img src={`${storageUrl}${submission.data.id}.png?alt=media`} />
        </Link>
        <div style={{ width: "50%" }}>
          {hasParent && !redundent_parent_id && (
            <button
              title="parent post"
              className={classnames("parent", { active: nextPost })}
              onClick={fetchParent}
            >
              ↑
            </button>
          )}

          <h3
            style={{
              flexGrow: 1,
              wordWrap: "break-word",
              fontSize: submission.data.title.length > 130 ? " 1.0em" : "1.1em",
              //   marginTop: hasParent ? 35 : 0,
            }}
          >
            {hasParent && <span className="blocker" />}
            <HyperText text={submission.data.title} />
          </h3>
          <span className="bottom-row">
            <span>{displayTime} </span>

            <button
              className="heart"
              onClick={() => voteFromBrowse(submission)}
            >
              {browseVotes[submission.id] || submission.data.score}
              {browseVotes[submission.id] ? "🖤" : "♡"}
            </button>
          </span>

          <button
            className="report"
            title="report"
            onClick={() => report(submission.id)}
          >
            !
          </button>
          {submission.data.children > (redundent_child_id ? 1 : 0) && (
            <button
              className={classnames("children", { active: childrenPosts })}
              title="show children"
              onClick={fetchChildren}
            >
              {submission.data.children}↓
            </button>
          )}
        </div>
      </div>

      {childrenPosts &&
        childrenPosts.map((childData) => (
          <Post
            key={childData.id}
            submission={childData}
            voteFromBrowse={voteFromBrowse}
            browseVotes={browseVotes}
            report={report}
            redundent_parent_id={submission.id}
          />
        ))}
    </div>
  );
}
